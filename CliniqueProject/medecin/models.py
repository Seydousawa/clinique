from django.db import models
from django.utils import timezone

class SoftDeleteManager(models.Manager):
    """Manager personnalisé pour filtrer les objets non supprimés par défaut"""
    
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)
    
    def all_with_deleted(self):
        """Retourne tous les objets, y compris ceux supprimés"""
        return super().get_queryset()
    
    def deleted_only(self):
        """Retourne uniquement les objets supprimés (archivés)"""
        return super().get_queryset().filter(is_deleted=True)


class Medecin(models.Model):
    id_medecin = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=100)
    prenom = models.CharField(max_length=100)
    specialite = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    
   
    is_deleted = models.BooleanField(default=False, verbose_name="Archivé")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'archivage")
    
  
    objects = SoftDeleteManager()  # Manager par défaut (sans les supprimés)
    all_objects = models.Manager()  # Manager pour accéder à tous les objets
    
    class Meta:
        verbose_name = "Médecin"
        verbose_name_plural = "Médecins"
        ordering = ['-id_medecin']

    def __str__(self):
        return f"{self.nom} {self.prenom}"
    
    def soft_delete(self):
        """Suppression douce (archivage)"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        self.save()
    
    def restore(self):
        """Restauration d'un objet archivé"""
        self.is_deleted = False
        self.deleted_at = None
        self.save()