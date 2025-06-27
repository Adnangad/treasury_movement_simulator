import graphene
from treasuryApi.schema import Query, Mutation
from strawberry_django.optimizer import DjangoOptimizerExtension
import strawberry

schema = strawberry.Schema(
    query=Query,
    mutation=Mutation,
    extensions=[
        DjangoOptimizerExtension,
    ],
)