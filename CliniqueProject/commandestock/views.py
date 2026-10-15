from django.shortcuts import render
from rest_framework.permissions import AllowAny  # CHANGE : AllowAny au lieu de IsAuthenticated
from rest_framework import viewsets, filters, status
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import CommandeStock
from .serializer import CommandeStockSerializer

class CommandeStockViewSet(viewsets.ModelViewSet):
    """CRUD pour les commandes de stock"""
    queryset = CommandeStock.objects.all()
    serializer_class = CommandeStockSerializer
    permission_classes = [AllowAny]  # ✅ CHANGE : Pas d'authentification requise
    
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['statut', 'fournisseur', 'produit']
    search_fields = ['produit__designation', 'fournisseur']
    ordering = ['-date_commande']
    
    @action(detail=True, methods=['post'])
    def recevoir(self, request, pk=None):
        """Marquer une commande comme reçue et augmenter le stock"""
        try:
            commande = self.get_object()
            commande.statut = 'recu'
            commande.date_reception = timezone.now().date()
            commande.save()
            
            # ✅ Mettre à jour le stock du produit
            produit = commande.produit
            produit.quantite_stock += commande.quantite
            produit.save()
            
            serializer = self.get_serializer(commande)
            return Response({
                'message': 'Commande marquée comme reçue',
                'commande': serializer.data,
                'nouveau_stock': produit.quantite_stock
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def commander(self, request, pk=None):
        """Marquer une commande comme commandée"""
        try:
            commande = self.get_object()
            commande.statut = 'commande'
            commande.save()
            
            serializer = self.get_serializer(commande)
            return Response({
                'message': 'Commande marquée comme commandée',
                'commande': serializer.data
            }, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({
                'error': str(e)
            }, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Obtenir les statistiques des commandes"""
        total = self.queryset.count()
        en_attente = self.queryset.filter(statut='en_attente').count()
        commandes = self.queryset.filter(statut='commande').count()
        recues = self.queryset.filter(statut='recu').count()
        
        return Response({
            'total': total,
            'en_attente': en_attente,
            'commandees': commandes,
            'recues': recues
        }, status=status.HTTP_200_OK)
