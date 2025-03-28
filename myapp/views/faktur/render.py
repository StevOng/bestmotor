from django.shortcuts import render
from ...decorators import *

@both_required
def faktur(request):
    return render(request, 'faktur.html')