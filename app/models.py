from sqlalchemy import Column, String, Text, TIMESTAMP, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from .database import Base

class Upload(Base):
    __tablename__ = "uploads"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    filename = Column(String)                        
    file_type = Column(String)                       
    upload_path = Column(Text)
    extracted_text = Column(Text)                    
    created_at = Column(TIMESTAMP)                   

class OCRResult(Base):
    __tablename__ = "ocr_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("uploads.id"))
    extracted_text = Column(Text)
    #engine = Column(String)
    ocr_time = Column(TIMESTAMP)

class DLPResult(Base):
    __tablename__ = "dlp_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    ocr_result_id = Column(UUID(as_uuid=True), ForeignKey("ocr_results.id"))
    info_type = Column(String)
    quote = Column(Text)
    likelihood = Column(String)
    original_text = Column(String)
    masked_text = Column(String)
    position_start = Column(String)
    position_end = Column(String)

class FaceDetection(Base):
    __tablename__ = "face_detections"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("uploads.id"))
    face_count = Column(String)
    method = Column(String)
    detection_time = Column(TIMESTAMP)

class FaceRegion(Base):
    __tablename__ = "face_regions"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    face_detection_id = Column(UUID(as_uuid=True), ForeignKey("face_detections.id"))
    x = Column(String)
    y = Column(String)
    width = Column(String)
    height = Column(String)

class MaskingResult(Base):
    __tablename__ = "masking_results"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("uploads.id"))
    masked_file_path = Column(Text)
    masking_method = Column(JSON)
    masking_time = Column(TIMESTAMP)

class Log(Base):
    __tablename__ = "logs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    upload_id = Column(UUID(as_uuid=True), ForeignKey("uploads.id"))
    stage = Column(String)
    message = Column(Text)
    timestamp = Column(TIMESTAMP)