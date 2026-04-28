#### Note: This project is a submission under Google Solution Challenge 2026.

# Sahi Bin – AI-Powered Waste Segregation System
<br>

## Overview

Sahi Bin is an AI-driven waste management system designed to improve waste segregation at the household level. It uses QR codes + image classification to ensure citizens dispose of waste correctly and encourages behavior change through a reward and penalty system.

## Problem

Improper waste segregation is a major issue in India:

Mixed waste reduces recycling efficiency
Lack of accountability at household level
No incentives for correct behavior
Increased landfill and pollution

## Solution

Sahi Bin introduces a smart monitoring system where:

Each household has a QR-coded bin
Workers scan QR codes during collection
Waste is verified using AI image classification
Citizens receive rewards or penalties based on segregation quality

## How It Works

Worker logs into the Sahi Bin app
Garbage vehicle reaches households
Worker scans QR code on bin
Worker captures image of waste
AI classifies waste:
Wet
Dry
Mixed
Data is stored in database
System assigns:
Rewards (correct segregation)
Penalties (mixed waste)

## Features

QR-based household identification
AI-powered waste classification
Reward & penalty mechanism
Eeal-time data tracking
Worker-friendly mobile interface
Scalable for city-level deployment

## Tech Stack

### Frontend:

HTML, CSS, JavaScript / React

### Backend:

Node.js / Firebase

### Database:

Firestore / MongoDB

### AI/ML:

TensorFlow / Teachable Machine

### Other:

QR Code Integration
Camera API

## System Architecture

User (Citizen)
      ↓
QR Code (Household ID)
      ↓
Worker App (Scan + Capture Image)
      ↓
Backend Server
      ↓
AI Model (Waste Classification)
      ↓
Database (Store Data)
      ↓
Reward / Penalty System
      ↓
Notification to User

## Impact

Improves waste segregation at source
Reduces landfill burden
Enables data-driven waste management
Encourages long-term behavioral change

## Future Scope

Integration with municipal systems
Tax benefits for high-performing households
Advanced AI for detailed waste categories
Multilingual support (Hindi, Marathi, etc.)
Route optimization for garbage vehicles

“Sahi Bin is submitted under Open Innovation in Smart Resource Allocation as it introduces an AI-driven system for improving waste segregation at the source. By combining QR-based tracking with image-based classification, the solution ensures efficient identification and allocation of waste resources, promoting sustainable urban management.”
