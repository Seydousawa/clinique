from django.db import models
from django.utils import timezone
from django.conf import settings

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


class Personnel(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, primary_key=True)
    
    # Champs pour le soft delete
    is_deleted = models.BooleanField(default=False, verbose_name="Archivé")
    deleted_at = models.DateTimeField(null=True, blank=True, verbose_name="Date d'archivage")
    
    # Managers
    objects = SoftDeleteManager()  # Manager par défaut (sans les supprimés)
    all_objects = models.Manager()  # Manager pour accéder à tous les objets
    
    class Meta:
        verbose_name = "Personnel"
        verbose_name_plural = "Personnel"
    
    def __str__(self):
        return f"{self.user.nom} {self.user.prenom}"
    
    def soft_delete(self):
        """Suppression douce (archivage)"""
        self.is_deleted = True
        self.deleted_at = timezone.now()
        # Désactiver également l'utilisateur associé
        if self.user:
            self.user.is_active = False
            self.user.save()
        self.save()
    
    def restore(self):
        """Restauration d'un objet archivé"""
        self.is_deleted = False
        self.deleted_at = None
        # Réactiver l'utilisateur associé
        if self.user:
            self.user.is_active = True
            self.user.save()
        self.save()