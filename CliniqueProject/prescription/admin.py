from django.contrib import admin
from .models import Prescription, Examen


@admin.register(Examen)
class ExamenAdmin(admin.ModelAdmin):
    list_display = ['nom', 'prix']
    search_fields = ['nom', 'description']


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ['id', 'type_prescription', 'patient', 'consultation', 'get_details', 'date_prescription']
    list_filter = ['type_prescription', 'date_prescription']
    search_fields = ['patient__nom', 'patient__prenom']
    readonly_fields = ['date_prescription']
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('consultation', 'patient', 'type_prescription', 'notes')
        }),
        ('Ordonnance (Médicament)', {
            'fields': ('produit', 'quantite', 'posologie'),
            'classes': ('collapse',),
        }),
        ('Examen Médical', {
            'fields': ('examen', 'instructions'),
            'classes': ('collapse',),
        }),
        ('Métadonnées', {
            'fields': ('date_prescription',),
        }),
    )
    
    def get_details(self, obj):
        if obj.type_prescription == 'ordonnance':
            return f"{obj.produit} x {obj.quantite}"
        else:
            return f"{obj.examen}"
    get_details.short_description = "Détails"