1. Executive Summary

Product Name: KitaKita
Product Vision: To provide visually impaired users with an unparalleled, real-time spatial and contextual understanding of their environment by fusing dynamic AI vision (Gemini Live) with a trusted human-volunteer fallback network.

Unlike traditional vision apps that rely on static, context-blind system prompts, KitaKita dynamically routes processing through specialized AI agents based on the user's current activity, ensuring high-speed, highly relevant environmental feedback.
2. Core Mechanics & Architecture

The application operates on a hybrid architecture, balancing cloud-based Large Multimodal Models (LMM) with edge compute and human-in-the-loop (HITL) WebRTC streaming.

    Primary Engine: Gemini Live (Multimodal audio/video streaming).

    State Management: Dynamic context switching. The system flushes irrelevant short-term memory when transitioning between physical contexts to reduce latency and hallucination.

    Audio UX: Spatial audio cues (panning sound to indicate object direction) and haptic feedback (vibration intensity indicating proximity).

3. Feature Specifications
3.1. Context-Aware Agentic Modes

The AI behavior is segmented into distinct operational modes, triggered by voice command, to narrow the context window and prioritize specific types of object detection.

    Cooking Mode: * Focus: 1-meter radius spatial reasoning.

        Priorities: Sharp edge tracking (knives), heat/hazard indicators (boiling water, steam), and ingredient identification.

    Outdoor Mode: * Focus: Low-latency, high-contrast moving object detection.

        Priorities: Traffic movement, pedestrian flow, reading signage in the wild (bus stops, street names). Integrates with location APIs to preload intersection data.

    Study & Reading Mode: * Focus: High-resolution OCR and knowledge extraction.

        Priorities: Real-time reading, summarizing text, and saving extracted concepts into a Retrieval-Augmented Generation (RAG) pipeline for later querying (e.g., "What did the textbook say about X?").

3.2. "Teach My World" (Spatial & Object Memory)

A personalized memory integration feature allowing the user to train the AI on their specific environment and belongings for improved daily survival and autonomy.

    Object Registration: Users can hold up a personal item and explicitly define it (e.g., "KitaKita, this is my red allergy medication"). The system captures visual signatures and stores them securely.

    Spatial Mapping: Users can establish persistent spatial relationships in their home (e.g., "The front door is at 12 o'clock from the kitchen island").

    Retrieval: The AI can actively scan for and locate registered items upon request (e.g., "Scan the desk and tell me where my keys are").

3.3. Hazard Override Framework

A critical safety layer designed to protect users in dynamic, unpredictable environments when the primary AI layer fails, loses confidence, or detects an emergency.

    Incident Detection: Integrates with the device accelerometer to detect hard falls or sudden impacts. Listens for audio distress markers.

    The "Panic Button": A universal hardware or voice trigger ("Emergency Fallback") that instantly drops the AI processing layer.

    Auto-Routing: Automatically dials a premium human volunteer, an emergency contact, or emergency services, immediately initiating a WebRTC camera and audio stream along with GPS coordinates.

    Offline Micro-Mode: If data connectivity drops, the app seamlessly falls back to a lightweight, on-device edge model capable of basic OCR and hazard recognition to prevent the user from being stranded.

3.4. Smart Community Handoff

A modernized approach to the traditional volunteer assistance model, optimizing the transition between AI and human.

    Confidence Thresholds: If the AI model's confidence score drops below a safe threshold for a critical task (e.g., identifying medication), it prompts the user to switch to a human volunteer.

    Context Payload: When a human volunteer accepts a call, they instantly receive an AI-generated summary of the last 30 seconds of activity (e.g., "User is trying to find the expiration date on this carton") so the user does not have to repeat themselves.

4. Technical & Non-Functional Requirements
Category	Requirement	Description
Performance	Dynamic Throttling	Frame rates must adjust based on mode. Outdoor Mode requires higher fps (e.g., 15-24 fps) for safety; Study Mode utilizes trigger-based or 1 fps capture to preserve battery.
Thermal	Heat Management	Continuous video streaming to an LMM requires aggressive resource management to prevent device thermal throttling.
Security	Data Privacy	Visual signatures captured via "Teach My World" must be stored locally on the device or in heavily encrypted, isolated personal vectors.
Accessibility	Voice-First UI	Complete operational control, including settings configuration and mode training, must be accessible purely via conversational voice flows.