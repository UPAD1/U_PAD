import torch
import numpy as np
from PIL import Image
import dnnlib
import legacy  # stylegan2-ada 라이브러리에 포함됨
import os
import cv2
import tempfile
from ultralytics import YOLO

STYLEGAN_MODEL_PATH = "models/stylegan2_ffhq.pkl"
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# 모델 로드 함수 (.pkl 기준)
def load_stylegan():
    with open(STYLEGAN_MODEL_PATH, 'rb') as f:
        G = legacy.load_network_pkl(f)['G_ema'].to(DEVICE)
    return G

# 랜덤 latent 생성
def generate_latent(seed=0):
    rnd = np.random.RandomState(seed)
    z = torch.from_numpy(rnd.randn(1, G.z_dim)).to(DEVICE)
    return z

# 이미지 생성
def generate_mascot_image(G, z):
    label = torch.zeros([1, G.c_dim], device=DEVICE)
    img = G(z, label, truncation_psi=1.0, noise_mode='const')
    img = (img.clamp(-1, 1) + 1) / 2
    img_np = img.squeeze(0).permute(1, 2, 0).cpu().numpy()
    pil_img = Image.fromarray((img_np * 255).astype(np.uint8))
    return pil_img

# 저장 및 반환
def create_mascot_image(save_path: str, seed=42):
    global G
    G = load_stylegan()
    z = generate_latent(seed)
    img = generate_mascot_image(G, z)
    img.save(save_path)
    return save_path
