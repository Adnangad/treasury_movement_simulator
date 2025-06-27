import strawberry
from strawberry_django import type as django_type
from strawberry import auto
from ..import models

@django_type(models.Accounts)
class AccountsType:
    id: auto
    account_name: auto
    amount: auto
    currency: auto

@django_type(models.Logs)
class LogsType:
    id: auto
    from_account: auto
    to_account: auto
    transferred_amnt: auto
    note: auto
    transaction_code: auto
    timestamp: auto
    
@strawberry.type
class fetchLogsResponseType:
    From: str
    To: str
    Amount: float
    TransactionCode: str
    Time: str
    Note: str

@strawberry.type
class ResponseType:
    status: str
    message: str
    
    
