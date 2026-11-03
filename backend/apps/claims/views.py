from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from .models import Claim
from .serializers import ClaimSerializer, ClaimCreateSerializer, ClaimStatusUpdateSerializer
from apps.items.models import Item


class ClaimListCreateView(generics.ListCreateAPIView):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ClaimCreateSerializer
        return ClaimSerializer

    def get_queryset(self):
        user = self.request.user
        params = self.request.query_params

        # Filter received claims (claims on items posted by me)
        if params.get('type') == 'received':
            return Claim.objects.filter(item__posted_by=user)

        # Filter item specific
        item_id = params.get('item_id')
        if item_id:
            # Check permission: user is claimant or item owner
            return Claim.objects.filter(item_id=item_id).filter(
                models_Q := Claim.objects.filter(claimant=user) | Claim.objects.filter(item__posted_by=user)
            )

        # Default: claims made by this user
        return Claim.objects.filter(claimant=user)

    def perform_create(self, serializer):
        serializer.save(claimant=self.request.user)


class ClaimDetailView(generics.RetrieveAPIView):
    queryset = Claim.objects.all()
    serializer_class = ClaimSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Claim.objects.all()
        return Claim.objects.filter(claimant=user) | Claim.objects.filter(item__posted_by=user)


class ClaimStatusUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        claim = get_object_or_404(Claim, pk=pk)
        item = claim.item

        # Check that user is the one who posted the item or staff
        if item.posted_by != request.user and not request.user.is_staff:
            return Response(
                {"detail": "Only the person who reported this item can review and approve claims."},
                status=status.HTTP_403_FORBIDDEN
            )

        new_status = request.data.get('status')
        owner_notes = request.data.get('owner_notes', claim.owner_notes)

        if new_status not in ['APPROVED', 'REJECTED', 'PENDING']:
            return Response(
                {"detail": "Invalid status. Must be APPROVED, REJECTED, or PENDING."},
                status=status.HTTP_400_BAD_REQUEST
            )

        claim.status = new_status
        claim.owner_notes = owner_notes
        claim.save()

        # If approved, update item status to RESOLVED
        if new_status == 'APPROVED':
            item.status = 'RESOLVED'
            item.save()
            # Also reject or leave other pending claims
        elif new_status == 'REJECTED' and item.status == 'RESOLVED':
            # Check if there are any other approved claims
            if not item.claims.filter(status='APPROVED').exists():
                item.status = 'OPEN'
                item.save()

        return Response(ClaimSerializer(claim).data)
