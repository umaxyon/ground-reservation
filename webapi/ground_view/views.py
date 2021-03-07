from django.shortcuts import render
from django.http import HttpResponse

# Create your views here.


def top(req):
    return render(req, 'index.html')
