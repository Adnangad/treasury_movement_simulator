from django.db import models

#This is the enum class for the different currencies
class Currency(models.TextChoices):
    KSH = "kshs"
    USD = "usd"
    NGN = "ngn"

class Accounts(models.Model):
    account_name = models.CharField(unique=True, max_length=255)
    amount = models.FloatField()
    currency = models.CharField(choices=Currency.choices, default=Currency.KSH)
    
    def __str__(self):
        return f"{self.account_name} ({self.currency}) - {self.amount}"


class Logs(models.Model):
    from_account = models.ForeignKey(Accounts, on_delete=models.CASCADE, related_name='sent_logs')
    to_account = models.ForeignKey(Accounts, on_delete=models.CASCADE, related_name='received_logs')
    transferred_amnt = models.FloatField()
    note = models.TextField(null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    transaction_code = models.CharField(max_length=10, unique=True, default="TempVal#")
    
    def __str__(self):
        return f"{self.from_account} → {self.to_account}: {self.transferred_amnt}"