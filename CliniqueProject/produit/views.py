from django.shortcuts import render
from produit.models import Produit
from .serializer import ProduitSerializer
from rest_framework.permissions import AllowAny
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from django.db import models
from django.utils import timezone
from datetime import timedelta
from rest_framework.decorators import action
from rest_framework.response import Response

class ProduitViewSet(viewsets.ModelViewSet):
    """CRUD pour les produits/médicaments"""
    queryset = Produit.objects.filter(actif=True)
    serializer_class = ProduitSerializer
    permission_classes = [AllowAny]  # Pas d'authentification requise
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['actif']
    search_fields = ['designation']
    ordering = ['designation']
    
    @action(detail=False, methods=['get'])
    def stock_faible(self, request):
        """Produits avec stock insuffisant"""
        produits = self.queryset.filter(
            quantite_stock__lte=models.F('stock_minimum')
        )
        serializer = self.get_serializer(produits, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def expires_bientot(self, request):
        """Produits qui expirent bientôt"""
        dans_30_jours = timezone.now().date() + timedelta(days=30)
        produits = self.queryset.filter(
            date_expiration__lte=dans_30_jours,
            date_expiration__gte=timezone.now().date()
        )
        serializer = self.get_serializer(produits, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def stock_disponible(self, request):
        """Produits avec stock disponible"""
        produits = self.queryset.filter(quantite_stock__gt=0)
        serializer = self.get_serializer(produits, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def valeur_totale_stock(self, request):
        """Calcule la valeur totale du stock"""
        produits = self.queryset.all()
        valeur_totale = sum(p.montant_total for p in produits)
        
        return Response({
            'valeur_totale_stock': valeur_totale,
            'nombre_produits': produits.count(),
            'montant_par_produit': [
                {
                    'designation': p.designation,
                    'prix': p.prix,
                    'quantite_stock': p.quantite_stock,
                    'montant_total': p.montant_total
                }
                for p in produits
            ]
        })
    