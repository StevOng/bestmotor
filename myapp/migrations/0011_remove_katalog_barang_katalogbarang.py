# Generated by Django 5.0.7 on 2025-06-20 15:09

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0010_returbeli_barang_returjual_barang'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='katalog',
            name='barang',
        ),
        migrations.CreateModel(
            name='KatalogBarang',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('gambar_pelengkap', models.ImageField(blank=True, null=True, upload_to='images/')),
                ('barang', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.barang')),
                ('katalog', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='myapp.katalog')),
            ],
        ),
    ]
