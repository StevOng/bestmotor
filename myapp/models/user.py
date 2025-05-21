from django.db import models

class User(models.Model):
    id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=50, unique=True)
    password = models.CharField(max_length=255)
    nama = models.CharField(max_length=50)
    ROLES = [
        ('admin', 'Admin'),
        ('sales', 'Sales')
    ]
    role = models.CharField(max_length=5, choices=ROLES)
    rute = models.CharField(max_length=255, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username
