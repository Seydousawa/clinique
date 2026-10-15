from rest_framework.routers import DefaultRouter
from .views import PersonnelViewSet
from django.urls import path, include 

router = DefaultRouter()
router.register(r'personnels', PersonnelViewSet, basename='personnel')

urlpatterns = [
      path('', include(router.urls))
   
]

    


