
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CommandeStockViewSet

router = DefaultRouter()
router.register(r'commandestocks', CommandeStockViewSet)

urlpatterns = [
    path('', include(router.urls)),
]