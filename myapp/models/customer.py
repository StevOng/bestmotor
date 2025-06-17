from django.db import models
from .user import *

class Customer(models.Model):
    id = models.AutoField(primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE)
    nama = models.CharField(max_length=50)
    no_hp = models.CharField(max_length=20, unique=True)
    lokasi = models.CharField(max_length=255)
    alamat_lengkap = models.CharField(max_length=255, null=True, blank=True)
    toko = models.CharField(max_length=255)
    catatan = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nama