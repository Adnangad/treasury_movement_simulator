from .models import Accounts, Logs
import strawberry
import random
import string
from .schemaTypes.types import AccountsType, ResponseType, LogsType, fetchLogsResponseType
from asgiref.sync import sync_to_async
from typing import Optional

def generate_random_code(length):
    """Generates a random string of specified length using letters and digits."""
    characters = string.ascii_letters + string.digits
    random_string = ''.join(random.choices(characters, k=length))
    return random_string

def ksh_to_USD(ksh):
    return ksh/ 120

def USD_to_ksh(USD):
    return USD * 120

def USD_to_NGN(USD):
    return USD * 150

def NGN_to_USD(NGN):
    return NGN / 150

def NGN_to_ksh(NGN):
    return NGN / 30

def ksh_to_NGN(ksh):
    return ksh * 30

@strawberry.input
class AccountInput:
    account_name: str
    amount: float
    currency: str

@strawberry.type
class createAccountsResp:
    status: str
    message: str
    accounts: list [AccountsType]



@strawberry.type
class Query:
    @strawberry.field
    def all_accounts(self) -> list[AccountsType]:
        return Accounts.objects.all()
    
    @strawberry.field
    async def all_logs(self) -> list[fetchLogsResponseType]:
        logs = await sync_to_async(list)(
            Logs.objects.select_related('from_account', 'to_account').all()
        )
        return [
            fetchLogsResponseType(
                From=log.from_account.account_name,
                To=log.to_account.account_name,
                Amount=log.transferred_amnt,
                TransactionCode=log.transaction_code,
                Time=str(log.timestamp),
                Note=log.note
            )
            for log in logs
        ]
    
@strawberry.type
class Mutation:
    @strawberry.mutation
    async def transferAmoney(self, accountId: int, receiverId: int, amount: float, note: Optional[str] = None) -> ResponseType:
        try:
            account = await sync_to_async(lambda: Accounts.objects.filter(id=accountId).first())()
            if not account:
                raise Exception("This account does not exist")

            receiver = await sync_to_async(lambda: Accounts.objects.filter(id=receiverId).first())()
            if not receiver:
                raise Exception("The receiver account does not exist")

            match (account.currency, receiver.currency):
                case ("KSHS", "USD"):
                    account.amount -= amount
                    if account.amount < 0:
                        return ResponseType(status="Error", message="You have insufficent balance in your account")
                    await sync_to_async(account.save)()
                    receiver.amount += ksh_to_USD(amount)
                    await sync_to_async(receiver.save)()
                    code = generate_random_code(7)
                    await sync_to_async(Logs.objects.create)(from_account=account, to_account=receiver, transferred_amnt=amount, note=note, transaction_code=code)
                    return ResponseType(status="Success", message="You have successfully transfered the amount")
                case ("KSHS", "NGN"):
                    account.amount -= amount
                    if account.amount < 0:
                        return ResponseType(status="Error", message="You have insufficent balance in your account")
                    await sync_to_async(account.save)()
                    receiver.amount += ksh_to_NGN(amount)
                    await sync_to_async(receiver.save)()
                    code = generate_random_code(7)
                    await sync_to_async(Logs.objects.create)(from_account=account, to_account=receiver, transferred_amnt=amount, note=note, transaction_code=code)
                    return ResponseType(status="Success", message="You have successfully transfered the amount")
                case ("NGN", "USD"):
                    account.amount -= amount
                    if account.amount < 0:
                        return ResponseType(status="Error", message="You have insufficent balance in your account")
                    await sync_to_async(account.save)()
                    receiver.amount += NGN_to_USD(amount)
                    await sync_to_async(receiver.save)()
                    code = generate_random_code(7)
                    await sync_to_async(Logs.objects.create)(from_account=account, to_account=receiver, transferred_amnt=amount, note=note, transaction_code=code)
                    return ResponseType(status="Success", message="You have successfully transfered the amount")
                case ("NGN", "KSHS"):
                    account.amount -= amount
                    if account.amount < 0:
                        return ResponseType(status="Error", message="You have insufficent balance in your account")
                    await sync_to_async(account.save)()
                    receiver.amount += NGN_to_ksh(amount)
                    await sync_to_async(receiver.save)()
                    code = generate_random_code(7)
                    await sync_to_async(Logs.objects.create)(from_account=account, to_account=receiver, transferred_amnt=amount, note=note, transaction_code=code)
                    return ResponseType(status="Success", message="You have successfully transfered the amount")
                case ("USD", "KSHS"):
                    account.amount -= amount
                    if account.amount < 0:
                        return ResponseType(status="Error", message="You have insufficent balance in your account")
                    await sync_to_async(account.save)()
                    receiver.amount += USD_to_ksh(amount)
                    await sync_to_async(receiver.save)()
                    code = generate_random_code(7)
                    await sync_to_async(Logs.objects.create)(from_account=account, to_account=receiver, transferred_amnt=amount, note=note, transaction_code=code)
                    return ResponseType(status="Success", message="You have successfully transfered the amount")
                case ("USD", "NGN"):
                    account.amount -= amount
                    if account.amount < 0:
                        return ResponseType(status="Error", message="You have insufficent balance in your account")
                    await sync_to_async(account.save)()
                    receiver.amount += USD_to_NGN(amount)
                    await sync_to_async(receiver.save)()
                    code = generate_random_code(7)
                    await sync_to_async(Logs.objects.create)(from_account=account, to_account=receiver, transferred_amnt=amount, note=note, transaction_code=code)
                    return ResponseType(status="Success", message="You have successfully transfered the amount")
                case _:
                    account.amount -= amount
                    if account.amount < 0:
                        return ResponseType(status="Error", message="You have insufficent balance in your account")
                    await sync_to_async(account.save)()
                    receiver.amount += amount
                    await sync_to_async(receiver.save)()
                    code = generate_random_code(7)
                    await sync_to_async(Logs.objects.create)(from_account=account, to_account=receiver, transferred_amnt=amount, note=note, transaction_code=code)
                    return ResponseType(status="Success", message="You have successfully transfered the amount")
        except Exception as e:
            print(f"Error is:: {e}")
            return ResponseType(status="Error", message="Unable to transfer the amount at this moment")
    @strawberry.mutation
    async def createAccounts(self, data: list[AccountInput]) -> createAccountsResp:
        try:
            created_accounts = []
            print("The input data received is:: ", data)
            for i in data:
                account = await sync_to_async(Accounts.objects.create)(account_name=i.account_name, amount=i.amount, currency=i.currency)
                created_accounts.append(account)
            print("CREATED ACCOUNTS ARE:: ", created_accounts)
            return createAccountsResp(status="Success", message="You have successfully created accounts", accounts=created_accounts)
        except Exception as e:
            print(f"Error is:: {e}")
            return createAccountsResp(status="Error", message=e, accounts=[])