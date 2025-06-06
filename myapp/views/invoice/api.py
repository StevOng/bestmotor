from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import viewsets
from django.db.models.functions import ExtractWeekDay
from django.db.models import Sum, Count
from datetime import date
from calendar import monthrange
from ...models.invoice import *
from .serializer import *

class InvoiceViewSet(viewsets.ModelViewSet):
    queryset = Invoice.objects.all()
    serializer_class = InvoiceSerializer

    @action(detail=False, methods=['get'])
    def expenses(self, request):
        bulan = request.GET.get('bulan', 'Januari')
        minggu = int(request.GET.get('minggu', 1))

        bulan_map = {
            'Januari': 1, 'Februari': 2, 'Maret': 3, 'April': 4,
            'Mei': 5, 'Juni': 6, 'Juli': 7, 'Agustus': 8,
            'September': 9, 'Oktober': 10, 'November': 11, 'Desember': 12
        }

        month_number = bulan_map.get(bulan, 1)

        year = date.today().year
        days_in_month = monthrange(year, month_number)[1]

        # Minggu ke-n (1-4)
        start_day = (minggu - 1) * 7 + 1
        end_day = min(start_day + 6, days_in_month)

        filter_start = date(year, month_number, start_day)
        filter_end = date(year, month_number, end_day)

        queryset = Invoice.objects.filter(
            created_at__date__range=[filter_start, filter_end]
        ).annotate(
            weekday=ExtractWeekDay('created_at')
        ).values('weekday').annotate(
            total=Sum('netto'),
            count=Count('id')
        )

        weekday_map = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu']
        data_dict = {day: 0 for day in weekday_map}

        for item in queryset:
            # ExtractWeekDay: 1=Sunday ... 7=Saturday
            index = (item['weekday'] + 5) % 7  # convert to 0=Senin, 6=Minggu
            data_dict[weekday_map[index]] = float(item['netto']) / 1_000_000  # juta

        total_pengeluaran = sum(item['netto'] for item in queryset)
        total_transaksi = sum(item['count'] for item in queryset)

        return Response({
            "categories": weekday_map,
            "values": [data_dict[day] for day in weekday_map],
            "total_pengeluaran": total_pengeluaran,
            "total_transaksi": total_transaksi
        })

class DetailInvoiceViewSet(viewsets.ModelViewSet):
    queryset = DetailInvoice.objects.all()
    serializer_class = DetailInvoiceSerializer