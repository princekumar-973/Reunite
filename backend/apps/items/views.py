from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db.models import Q, Count
from .models import Item
from .serializers import ItemSerializer
from datetime import date, timedelta


class IsOwnerOrReadOnly(permissions.BasePermission):
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj.posted_by == request.user or request.user.is_staff


class ItemListCreateView(generics.ListCreateAPIView):
    serializer_class = ItemSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = Item.objects.all()
        params = self.request.query_params

        item_type = params.get('item_type')
        if item_type and item_type.upper() in ['LOST', 'FOUND']:
            queryset = queryset.filter(item_type=item_type.upper())

        category = params.get('category')
        if category and category != 'ALL':
            queryset = queryset.filter(category=category.upper())

        item_status = params.get('status')
        if item_status and item_status != 'ALL':
            queryset = queryset.filter(status=item_status.upper())

        campus_area = params.get('campus_area')
        if campus_area:
            queryset = queryset.filter(campus_area__icontains=campus_area)

        q = params.get('q')
        if q:
            queryset = queryset.filter(
                Q(title__icontains=q) |
                Q(description__icontains=q) |
                Q(location__icontains=q) |
                Q(brand__icontains=q) |
                Q(primary_color__icontains=q)
            )

        my_items = params.get('my_items')
        if my_items == 'true' and self.request.user.is_authenticated:
            queryset = queryset.filter(posted_by=self.request.user)

        return queryset

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(posted_by=self.request.user)
        else:
            serializer.save()


class ItemDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    permission_classes = [IsOwnerOrReadOnly]


class ItemStatsView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        total_items = Item.objects.count()
        lost_count = Item.objects.filter(item_type='LOST').count()
        found_count = Item.objects.filter(item_type='FOUND').count()
        resolved_count = Item.objects.filter(status='RESOLVED').count()
        active_count = Item.objects.filter(status='OPEN').count()

        # Group by category counts
        categories = {}
        for code, label in Item.CATEGORY_CHOICES:
            categories[code] = {
                'label': label,
                'count': Item.objects.filter(category=code).count()
            }

        return Response({
            "total": total_items,
            "lost": lost_count,
            "found": found_count,
            "resolved": resolved_count,
            "active": active_count,
            "categories": categories
        })


class SeedDemoDataView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        # Create demo items if empty or forced
        today = date.today()
        demo_items_data = [
            {
                "title": "Space Gray MacBook Pro 14\"",
                "item_type": "LOST",
                "category": "ELECTRONICS",
                "status": "OPEN",
                "description": "Lost in the Science Library, 2nd floor silent reading zone. Has an MIT sticker and dark blue hardshell case. Serial number known to owner.",
                "location": "Science Library, 2nd Floor Silent Room",
                "campus_area": "North Campus",
                "date_lost_or_found": today - timedelta(days=2),
                "primary_color": "Space Gray",
                "brand": "Apple",
                "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
                "contact_email": "alex.student@university.edu",
                "contact_phone": "+1 (555) 234-8901",
                "secret_verification_question": "What is the lock screen wallpaper and sticker text on the keyboard deck?"
            },
            {
                "title": "AirPods Pro (2nd Gen) with MagSafe Case",
                "item_type": "FOUND",
                "category": "ELECTRONICS",
                "status": "OPEN",
                "description": "Found on table #14 in Student Center Cafeteria. Case has a small green silicone carabiner attached.",
                "location": "Student Center Cafeteria Table #14",
                "campus_area": "Central Campus",
                "date_lost_or_found": today - timedelta(days=1),
                "primary_color": "White",
                "brand": "Apple",
                "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80",
                "contact_email": "security.desk@university.edu",
                "contact_phone": "+1 (555) 019-2834",
                "secret_verification_question": "What custom engraving or Bluetooth device name shows when connected?"
            },
            {
                "title": "Brown Leather Bi-fold Wallet with ID & Cards",
                "item_type": "LOST",
                "category": "WALLETS_CARDS",
                "status": "OPEN",
                "description": "Lost near the engineering courtyard benches. Contains student ID, transit pass, and health card. Reward offered for safe return!",
                "location": "Engineering Quad / Courtyard Benches",
                "campus_area": "South Campus",
                "date_lost_or_found": today - timedelta(days=3),
                "primary_color": "Brown",
                "brand": "Bellroy",
                "image_url": "https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&auto=format&fit=crop&q=80",
                "contact_email": "marcus.k@university.edu",
                "contact_phone": "+1 (555) 782-9012",
                "secret_verification_question": "What is the initials or photo kept inside the clear plastic slot?"
            },
            {
                "title": "Set of 4 Brass Keys with Blue Subaru Fob",
                "item_type": "FOUND",
                "category": "KEYS",
                "status": "OPEN",
                "description": "Turned in to gym front desk. Keychain has a woven paracord strap and blue Subaru electronic fob.",
                "location": "Athletic Complex Gym Locker Room",
                "campus_area": "West Campus",
                "date_lost_or_found": today - timedelta(days=4),
                "primary_color": "Brass / Blue",
                "brand": "Subaru / Yale",
                "image_url": "https://images.unsplash.com/photo-1582139329536-e7284fece509?w=800&auto=format&fit=crop&q=80",
                "contact_email": "recreation@university.edu",
                "contact_phone": "+1 (555) 430-1122",
                "secret_verification_question": "What word is stamped on the smallest silver key?"
            },
            {
                "title": "Hydro Flask 32oz Wide Mouth Water Bottle",
                "item_type": "FOUND",
                "category": "OTHER",
                "status": "OPEN",
                "description": "Left on lecture hall seat in Hall 101 after Organic Chemistry lecture. Covered in outdoor national park stickers.",
                "location": "Chemistry Hall 101, Row F",
                "campus_area": "Science Quad",
                "date_lost_or_found": today - timedelta(days=2),
                "primary_color": "Cobalt Blue",
                "brand": "Hydro Flask",
                "image_url": "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&auto=format&fit=crop&q=80",
                "contact_email": "ta.chem@university.edu",
                "contact_phone": "+1 (555) 910-3344",
                "secret_verification_question": "Which national park is depicted on the largest round sticker?"
            },
            {
                "title": "Patagonia Nano Puff Jacket (Men's M)",
                "item_type": "LOST",
                "category": "CLOTHING_ACCESSORIES",
                "status": "RESOLVED",
                "description": "Left on the chair in Coffee Bean Cafe. Successfully reunited with owner thanks to campus lost & found!",
                "location": "Campus Center Coffee Bean Cafe",
                "campus_area": "Central Campus",
                "date_lost_or_found": today - timedelta(days=6),
                "primary_color": "Navy Blue",
                "brand": "Patagonia",
                "image_url": "https://images.unsplash.com/photo-1544441893-675973e31985?w=800&auto=format&fit=crop&q=80",
                "contact_email": "sarah.w@university.edu",
                "contact_phone": "+1 (555) 829-1144",
                "secret_verification_question": "What was inside the interior zipped chest pocket?"
            },
            {
                "title": "Herschel Little America Backpack (Black)",
                "item_type": "FOUND",
                "category": "BAGS_BACKPACKS",
                "status": "OPEN",
                "description": "Found near bus stop #3 outside Campus Gate A. Contains textbooks and spiral notebooks. Currently secured at Transit Office.",
                "location": "Bus Stop #3, Main Gate A",
                "campus_area": "Campus Perimeter",
                "date_lost_or_found": today,
                "primary_color": "Black / Tan Straps",
                "brand": "Herschel",
                "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80",
                "contact_email": "transit.desk@university.edu",
                "contact_phone": "+1 (555) 302-8822",
                "secret_verification_question": "What is the subject title of the textbook in the main compartment?"
            },
            {
                "title": "Casio FX-991EX Scientific Calculator",
                "item_type": "LOST",
                "category": "BOOKS_STATIONERY",
                "status": "OPEN",
                "description": "Lost during Calculus II exam in Math Building Room 204. Has white correction fluid initials on the sliding cover.",
                "location": "Math Building Room 204",
                "campus_area": "North Campus",
                "date_lost_or_found": today - timedelta(days=1),
                "primary_color": "Black & White",
                "brand": "Casio",
                "image_url": "https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=800&auto=format&fit=crop&q=80",
                "contact_email": "david.math@university.edu",
                "contact_phone": "+1 (555) 674-9021",
                "secret_verification_question": "What are the exact initials on the rear cover?"
            }
        ]

        created_items = []
        for item_data in demo_items_data:
            item, _ = Item.objects.get_or_create(
                title=item_data['title'],
                defaults=item_data
            )
            created_items.append(item.id)

        return Response({
            "message": f"Successfully seeded {len(created_items)} items.",
            "count": len(created_items)
        }, status=status.HTTP_201_CREATED)
