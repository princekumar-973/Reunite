from django.db import models
from django.contrib.auth.models import User
from apps.items.models import Item


class Claim(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'Pending Review'),
        ('APPROVED', 'Approved'),
        ('REJECTED', 'Rejected'),
        ('WITHDRAWN', 'Withdrawn'),
    )

    item = models.ForeignKey(Item, on_delete=models.CASCADE, related_name='claims')
    claimant = models.ForeignKey(User, on_delete=models.CASCADE, related_name='claims')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    proof_description = models.TextField(
        help_text='Detailed proof explaining identifying marks, serial numbers, exact contents or characteristics.'
    )
    proof_image = models.ImageField(upload_to='claims_proof/', blank=True, null=True)
    proof_image_url = models.CharField(max_length=600, blank=True, default='')
    contact_phone = models.CharField(max_length=30, blank=True, default='')
    owner_notes = models.TextField(blank=True, default='', help_text='Feedback or pickup notes from the item reporter')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Claim #{self.id} for {self.item.title} by {self.claimant.username} ({self.status})"
