from rest_framework import serializers
from .models import Item


class ItemSerializer(serializers.ModelSerializer):
    id = serializers.CharField(read_only=True)
    posted_by = serializers.CharField(source='posted_by.id', read_only=True)
    posted_by_username = serializers.CharField(source='posted_by.username', read_only=True)
    posted_by_name = serializers.SerializerMethodField()
    claims_count = serializers.SerializerMethodField()
    image_display_url = serializers.SerializerMethodField()

    class Meta:
        model = Item
        fields = [
            'id',
            'title',
            'item_type',
            'category',
            'status',
            'description',
            'location',
            'campus_area',
            'date_lost_or_found',
            'primary_color',
            'brand',
            'latitude',
            'longitude',
            'image_url',
            'image',
            'image_display_url',
            'contact_email',
            'contact_phone',
            'secret_verification_question',
            'posted_by',
            'posted_by_username',
            'posted_by_name',
            'claims_count',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'posted_by', 'created_at', 'updated_at']

    def get_posted_by_name(self, obj):
        if obj.posted_by:
            full_name = f"{obj.posted_by.first_name} {obj.posted_by.last_name}".strip()
            return full_name if full_name else obj.posted_by.username
        return 'Anonymous'

    def get_claims_count(self, obj):
        return obj.claims.count() if hasattr(obj, 'claims') else 0

    def get_image_display_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url if obj.image_url else None
