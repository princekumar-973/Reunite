from rest_framework import serializers
from .models import Claim
from apps.items.models import Item


class ClaimSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    item = serializers.CharField(source='item.id', read_only=True)
    claimant = serializers.CharField(source='claimant.id', read_only=True)
    claimant_username = serializers.CharField(source='claimant.username', read_only=True)
    claimant_name = serializers.SerializerMethodField()
    claimant_email = serializers.CharField(source='claimant.email', read_only=True)
    item_title = serializers.CharField(source='item.title', read_only=True)
    item_type = serializers.CharField(source='item.item_type', read_only=True)
    item_image_url = serializers.CharField(source='item.image_url', read_only=True)
    item_location = serializers.CharField(source='item.location', read_only=True)
    item_posted_by_id = serializers.CharField(source='item.posted_by_id', read_only=True)

    class Meta:
        model = Claim
        fields = [
            'id',
            'item',
            'item_title',
            'item_type',
            'item_image_url',
            'item_location',
            'item_posted_by_id',
            'claimant',
            'claimant_username',
            'claimant_name',
            'claimant_email',
            'status',
            'proof_description',
            'proof_image',
            'proof_image_url',
            'contact_phone',
            'owner_notes',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'claimant', 'status', 'created_at', 'updated_at']

    def get_claimant_name(self, obj):
        if obj.claimant:
            full = f"{obj.claimant.first_name} {obj.claimant.last_name}".strip()
            return full if full else obj.claimant.username
        return 'Unknown'


class ClaimCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ['id', 'item', 'proof_description', 'proof_image', 'proof_image_url', 'contact_phone']
        read_only_fields = ['id']

    def validate(self, attrs):
        item = attrs.get('item')
        if item.status == 'RESOLVED':
            raise serializers.ValidationError("This item has already been marked as resolved.")
        return attrs

    def to_representation(self, instance):
        return ClaimSerializer(instance, context=self.context).data


class ClaimStatusUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Claim
        fields = ['status', 'owner_notes']
