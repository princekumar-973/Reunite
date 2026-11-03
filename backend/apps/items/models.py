from django.db import models
from django.contrib.auth.models import User


class Item(models.Model):
    ITEM_TYPE_CHOICES = (
        ('LOST', 'Lost Item'),
        ('FOUND', 'Found Item'),
    )

    CATEGORY_CHOICES = (
        ('ELECTRONICS', 'Electronics & Gadgets'),
        ('WALLETS_CARDS', 'Wallets, Purses & IDs'),
        ('KEYS', 'Keys & Keychains'),
        ('BAGS_BACKPACKS', 'Bags & Backpacks'),
        ('CLOTHING_ACCESSORIES', 'Clothing & Accessories'),
        ('BOOKS_STATIONERY', 'Books & Documents'),
        ('JEWELRY_WATCHES', 'Jewelry & Watches'),
        ('OTHER', 'Other / Miscellaneous'),
    )

    STATUS_CHOICES = (
        ('OPEN', 'Open / Active'),
        ('CLAIMED', 'Claim In Review'),
        ('RESOLVED', 'Resolved / Returned'),
        ('CLOSED', 'Closed'),
    )

    title = models.CharField(max_length=200)
    item_type = models.CharField(max_length=10, choices=ITEM_TYPE_CHOICES, default='LOST')
    category = models.CharField(max_length=30, choices=CATEGORY_CHOICES, default='OTHER')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='OPEN')
    description = models.TextField()
    location = models.CharField(max_length=255)
    campus_area = models.CharField(max_length=100, blank=True, default='')
    date_lost_or_found = models.DateField()
    primary_color = models.CharField(max_length=50, blank=True, default='')
    brand = models.CharField(max_length=100, blank=True, default='')
    latitude = models.FloatField(null=True, blank=True)
    longitude = models.FloatField(null=True, blank=True)
    image_url = models.TextField(blank=True, default='')
    image = models.ImageField(upload_to='items/', blank=True, null=True)
    contact_email = models.EmailField()
    contact_phone = models.CharField(max_length=30, blank=True, default='')
    secret_verification_question = models.CharField(
        max_length=255,
        blank=True,
        default='',
        help_text='A question or detail only the rightful owner would know to prove ownership'
    )
    posted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='items')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"[{self.item_type}] {self.title} ({self.status})"

    @property
    def display_image(self):
        if self.image:
            return self.image.url
        if self.image_url:
            return self.image_url
        return None
