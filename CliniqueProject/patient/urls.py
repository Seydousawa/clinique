
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PatientViewSet

# Création d’un router DRF
router = DefaultRouter()

router.register(r'patients', PatientViewSet, basename= "patient" )

urlpatterns = [
    path('', include(router.urls)),
]
