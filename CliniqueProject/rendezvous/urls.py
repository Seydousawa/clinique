from rest_framework import urls
from .views import RendezVousViewSet
from rest_framework.routers import DefaultRouter
from django.urls import path,include


router = DefaultRouter()
router.register(r'rendezvous', RendezVousViewSet, basename= "rendezvous")

urlpatterns = [
    path( '',include(router.urls))
]

