

from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('user.urls')),  
    path('api/', include('medecin.urls')), 
    path('api/', include('patient.urls')),
    path('api/', include('personnel.urls')),
    path('api/', include('rendezvous.urls')),
    path('api/', include('hospitalisation.urls')),
    path('api/', include('consultation.urls')),
    path('api/', include('prescription.urls')),
    path('api/', include('produit.urls')),
    path('api/', include('commandestock.urls')),
    path('api/', include('facture.urls')),
     
]   

