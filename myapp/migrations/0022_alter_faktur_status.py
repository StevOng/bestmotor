# Generated by Django 5.0.7 on 2025-06-29 11:12

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0021_alter_faktur_potongan'),
    ]

    operations = [
        migrations.AlterField(
            model_name='faktur',
            name='status',
            field=models.CharField(choices=[('belum_lunas', 'Belum Lunas'), ('jatuh_tempo', 'Jatuh Tempo'), ('lunas', 'Lunas')], default='belum_lunas', max_length=30),
        ),
    ]
