import logging
from app.db.database import engine, Base
from app.db.models import User, Group, GroupMember, PastBill, PastBillItem

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    logger.info("Creating initial data")
    Base.metadata.create_all(bind=engine)
    logger.info("Initial data created")

if __name__ == "__main__":
    init_db()
