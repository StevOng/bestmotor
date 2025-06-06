let incomeChart = null
let expenseChart = null

const income_options = {
    chart: { type: "area", height: "100%" },
    series: [],
    xaxis: {
        categories: [],
        labels: {
            show: true,
            style: {
                fontFamily: "Inter, sans-serif",
                cssClass: 'text-xs font-normal fill-gray-500'
            }
        }
    },
    stroke: { curve: 'smooth' },
    tooltip: { y: { formatter: val => `Rp ${val.toFixed(2)} juta` } }
};

const expense_options = {
    chart: { type: "area", height: "100%" },
    series: [],
    xaxis: {
        categories: [],
        labels: {
            show: true,
            style: {
                fontFamily: "Inter, sans-serif",
                cssClass: 'text-xs font-normal fill-gray-500'
            }
        }
    },
    stroke: { curve: 'smooth' },
    tooltip: { y: { formatter: val => `Rp ${val.toFixed(2)} juta` } }
};

const fetchIncomeData = async (month, week) => {
    try {
        const res = await fetch(`/api/pesanan/income/?bulan=${month}&minggu=${week}`);
        if (!res.ok) throw new Error("Failed to fetch data");
        const data = await res.json();

        // Update info pendapatan
        const infoDiv = document.getElementById("pendapatan-info");
        const pesananBulanan = document.getElementById("pesananBulanan")
        const countPesanan = document.getElementById("countPesanan")
        const total = data.total_income || 0;
        const transaksi = data.total_orders || 0;

        infoDiv.innerHTML = `Rp ${formatRupiah(total)},00 <span class="text-gray-400 text-sm my-auto">• ${transaksi} Transaksi</span>`;
        pesananBulanan.innerText = `Bulan ${month}`
        countPesanan.innerText = transaksi

        incomeChart.updateOptions({
            series: [{
                name: "Pendapatan Bulanan",
                data: data.values,
                color: "#3B82F6"
            }],
            xaxis: {
                categories: data.categories
            }
        });
    } catch (err) {
        console.error(err);
    }
}

document.getElementById("dropdownbtn").addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
        const week = e.target.dataset.week;
        const month = document.getElementById("incomeMonthDropdownButton").dataset.month;
        document.getElementById("incomeDropdownButton").textContent = `Minggu ke-${week}`;
        document.getElementById("incomeDropdownButton").dataset.week = week;
        updateIncomeChart(month, week)
    }
});

document.getElementById("monthDropdownbtn").addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
        const month = e.target.dataset.month;
        const week = document.getElementById("incomeDropdownButton").dataset.week;
        document.getElementById("incomeMonthDropdownButton").textContent = e.target.textContent;
        document.getElementById("incomeMonthDropdownButton").dataset.month = month;
        updateIncomeChart(month, week)
    }
});

// Update income ApexChart
async function updateIncomeChart(month, week) {
    const chartData = await fetchIncomeData(month, week);
    if (chartData) {
        chart.updateOptions({
            xaxis: chartData.xaxis,
            series: chartData.series
        });
    }
}

if (document.getElementById("income-chart") && typeof ApexCharts !== 'undefined') {
    incomeChart = new ApexCharts(document.querySelector("#income-chart"), income_options);
    incomeChart.render();
    document.getElementById("incomeDropdownButton").dataset.week = "1";
    document.getElementById("incomeMonthDropdownButton").dataset.month = "Januari";
    updateIncomeChart("Januari", "1");  // Default: Januari minggu ke-1
}

function formatRupiah(angka) {
    return angka.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


// {% comment %} Grafik Pengeluaran {% endcomment %}
const fetchExpenseData = async (selectedMonth, selectedWeek) => {
    try {
        const response = await fetch(`/api/invoice/expenses/?bulan=${selectedMonth}&minggu=${selectedWeek}`);
        if (!response.ok) throw new Error("Failed to fetch data");

        const data = await response.json();

        // Update info pengeluaran
        const infoDiv = document.getElementById("pengeluaran-info");
        const total = data.total_pengeluaran || 0;
        const transaksi = data.total_transaksi || 0;

        infoDiv.innerHTML = `Rp ${formatRupiah(total)},00 <span class="text-gray-400 text-sm my-auto">• ${transaksi} Transaksi</span>`;

        return {
            series: [
                {
                    name: "Pengeluaran Bulanan",
                    data: data.values,
                    color: "#EE6C4D",
                }
            ],
            xaxis: {
                categories: data.categories, // e.g., ['Senin', 'Selasa', ...]
            }
        };
    } catch (error) {
        console.error("Fetch error:", error);
        return null;
    }
};

//Event listener dropdown
document.getElementById("dropdown").addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
        const selectedWeek = e.target.dataset.week;
        const selectedMonth = document.getElementById("monthDropdownButton").dataset.month;
        document.getElementById("dropdownButton").textContent = `Minggu ke-${selectedWeek}`;
        document.getElementById("dropdownButton").dataset.week = selectedWeek;
        updateExpenseChart(selectedMonth, selectedWeek);
    }
});

document.getElementById("monthDropdown").addEventListener("click", async (e) => {
    if (e.target.tagName === "A") {
        const selectedMonth = e.target.dataset.month;
        const selectedWeek = document.getElementById("dropdownButton").dataset.week;
        document.getElementById("monthDropdownButton").textContent = selectedMonth;
        document.getElementById("monthDropdownButton").dataset.month = selectedMonth;
        updateExpenseChart(selectedMonth, selectedWeek);
    }
});

// Update expenses ApexChart
async function updateExpenseChart(month, week) {
    const chartData = await fetchExpenseData(month, week);
    if (chartData) {
        chart.updateOptions({
            xaxis: chartData.xaxis,
            series: chartData.series
        });
    }
}


if (document.getElementById("expense-chart") && typeof ApexCharts !== 'undefined') {
    expenseChart = new ApexCharts(document.getElementById("expense-chart"), expense_options);
    expenseChart.render();
    document.getElementById("dropdown").dataset.week = "1";
    document.getElementById("monthDropdown").dataset.month = "Januari";
    updateExpenseChart("Januari", "1");
}

// {% comment %} Pie Chart Laku {% endcomment %}
const getPieBarangTidakLaku = async () => {
    try {
        const response = await fetch("/api/barang/least_sold/");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        const colors = [
            "#F87171", "#FB923C", "#FBBF24", "#FACC15", "#4ADE80",
            "#34D399", "#22D3EE", "#60A5FA", "#A78BFA", "#F472B6"
        ];

        const labels = data.map(item => item.nama_barang);
        const series = data.map(item => item.qty_terjual);
        const pieColors = data.map((_, i) => colors[i % colors.length]);

        return {
            series,
            colors: pieColors,
            chart: { type: 'pie', height: 250, width: "100%" },
            labels,
            stroke: { colors: ["transparent"] },
            dataLabels: {
                enabled: false,
                style: { fontFamily: "Inter, sans-serif" },
            },
            legend: {
                fontFamily: "Inter, sans-serif",
                formatter: (label, opts) =>
                    `${label}: ${opts.w.globals.series[opts.seriesIndex]} terjual`,
                horizontalAlign: "center",
            }
        };
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
};

if (document.getElementById("pie-laku") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("pie-tlaku"), getPieBarangLaku());
    chart.render();
}

// {% comment %} Pie Chart Tak Laku {% endcomment %}
const getPieBarangLaku = async () => {
    try {
        const response = await fetch("/api/barang/top_sold/");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        const colors = [
            "#3F83F8", "#8FA4BF", "#3D5A80", "#293241", "#58A2CD",
            "#98C1D9", "#B8C9E0", "#E0FBFC", "#115EC3", "#D6DCE4"
        ];

        const labels = data.map(item => item.nama_barang);
        const series = data.map(item => item.qty_terjual);
        const pieColors = data.map((_, i) => colors[i % colors.length]);

        return {
            series,
            colors: pieColors,
            chart: { type: 'pie', height: 250, width: "100%" },
            labels,
            stroke: { colors: ["transparent"] },
            dataLabels: {
                enabled: false,
                style: { fontFamily: "Inter, sans-serif" },
            },
            legend: {
                fontFamily: "Inter, sans-serif",
                formatter: (label, opts) =>
                    `${label}: ${opts.w.globals.series[opts.seriesIndex]} terjual`,
                horizontalAlign: "center",
            }
        };
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
};

if (document.getElementById("pie-tlaku") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("pie-laku"), getPieTLaku());
    chart.render();
}

// {% comment %} Pie Chart Hampir Habis {% endcomment %}
const getPieHabis = async () => {
    try {
        const response = await fetch("/api/barang/low_stock/");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        // Warna default (looping jika < 10)
        const colors = [
            "#293241", "#3D5A80", "#8FA4BF", "#77AECE", "#98C1D9",
            "#3F83F8", "#E0FBFC", "#58A2CD", "#B8C9E0", "#D6DCE4"
        ];

        const labels = data.map(item => item.nama_barang);
        const series = data.map(item => item.stok);
        const pieColors = data.map((_, idx) => colors[idx % colors.length]);

        return {
            series: series,
            colors: pieColors,
            chart: {
                height: 250,
                width: "100%",
                type: "pie",
            },
            stroke: {
                colors: ["transparent"],
            },
            labels: labels,
            dataLabels: {
                enabled: false,
                style: {
                    fontFamily: "Inter, sans-serif",
                },
            },
            legend: {
                fontFamily: "Inter, sans-serif",
                formatter: function (label, opts) {
                    return `${label}: ${opts.w.globals.series[opts.seriesIndex]} stok`;
                },
                horizontalAlign: "center",
            },
        };
    } catch (error) {
        console.error("Error fetching pie chart data:", error);
        return null;
    }
};

if (document.getElementById("pie-habis") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("pie-habis"), getPieHabis());
    chart.render();
}

// {% comment %} Pie Chart Tak Laku {% endcomment %}
const getPieCustomer = async () => {
    try {
        const response = await fetch("/api/pesanan/top_customer/");
        if (!response.ok) throw new Error("Failed to fetch");

        const data = await response.json();

        const colors = [
            "#3B82F6", "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B",
            "#10B981", "#EF4444", "#A855F7", "#14B8A6", "#F87171"
        ];

        const labels = data.map(item => item.customer);
        const series = data.map(item => parseFloat(item.total_belanja));
        const pieColors = data.map((_, idx) => colors[idx % colors.length]);

        return {
            series: series,
            colors: pieColors,
            chart: {
                height: 250,
                width: "100%",
                type: "pie",
            },
            stroke: {
                colors: ["transparent"],
            },
            labels: labels,
            dataLabels: {
                enabled: false,
                style: {
                    fontFamily: "Inter, sans-serif",
                },
            },
            legend: {
                fontFamily: "Inter, sans-serif",
                formatter: function (label, opts) {
                    return `${label}: Rp${opts.w.globals.series[opts.seriesIndex].toLocaleString()}`;
                },
                horizontalAlign: "center",
            },
        };
    } catch (error) {
        console.error("Error fetching customer pie chart:", error);
        return null;
    }
};

if (document.getElementById("pie-customer") && typeof ApexCharts !== 'undefined') {
    const chart = new ApexCharts(document.getElementById("pie-customer"), getPieCustomer());
    chart.render();
}

// {% comment %} tabel {% endcomment %}

$(document).ready(function () {
    let table = $('#allpesanan').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // kolom 8 dan 9 di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#tableSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });
});

$(document).ready(function () {
    let table = $('#detailBrg').DataTable({
        pageLength: 20,
        lengthChange: false, // Hilangkan "Show entries"
        ordering: false,
        scrollX: true,
        "columnDefs": [
            { className: "text-center", targets: [-1, -2] } // kolom 8 dan 9 di tengah
        ],
    });
    $('.dt-search').remove();
    $('.dt-info').remove();

    $('#tableSearch').on('keyup', function () { //search
        let searchValue = $(this).val();
        table.search(searchValue).draw();
    });

    $('#kodebrg-dropdown').select2({
        dropdownAutoWidth: true,
        width: '100%',
        templateSelection: function (data) {
            return data.id || ''; // Hanya menampilkan kode barang setelah dipilih
        }
    }); //dropdown

    let barangData = {};
    let hargaData = {};

    $('#kodebrg-dropdown').on('change', function () {
        let selectedKode = $(this).val();
        let namaBarang = barangData[selectedKode] || '';
        let hargaBarang = hargaData[selectedKode] || '';

        let inputHargaBrg = $('#input_hrgbrg');
        let namaBrg = $('#namaBrg');
        namaBrg.empty();
        namaBrg.append(namaBarang);
        namaBrg.val(namaBarang).trigger('change');

        inputHargaBrg.empty();
        inputHargaBrg.val(hargaBarang).trigger('change');
    });
});