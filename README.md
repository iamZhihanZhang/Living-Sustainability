# Living Sustainability: In-Context Interactive Environmental Impact Communication
[Zhihan Zhang](https://homes.cs.washington.edu/~zzhihan/), 
[Puvarin Thavikulwat](https://www.pu-thavi.com/living-sustainability), 
Alexander Le Metzger, 
Yuxuan Mei, 
Felix Hähnlein, 
Zachary Englhardt, 
Gregory D. Abowd, 
Shwetak Patel, 
Adriana Schulz, 
[Tingyu Cheng](https://tingyucheng.com), 
[Vikram Iyer](https://homes.cs.washington.edu/~vsiyer/)

## Abstract
Climate change demands urgent action, yet understanding the environmental impact (EI) of everyday objects and activities remains challenging for the general public. While Life Cycle Assessment (LCA) offers a comprehensive framework for EI analysis, its traditional implementation requires extensive domain expertise, structured input data, and significant time investment, creating barriers for non-experts seeking real-time sustainability insights. Here we present the first autonomous sustainability assessment tool that bridges this gap by transforming unstructured natural language descriptions into in-context, interactive EI visualizations. Our approach combines language modeling and AI agents, and achieves >97% accuracy in transforming natural language into a data abstraction designed for simplified LCA modeling. The system employs a non-parametric datastore to integrate proprietary LCA databases while maintaining data source attribution and allowing personalized source management. We demonstrate through case studies that our system achieves results within 11% of traditional full LCA, while accelerating from hours of expert time to real-time. We conducted a formative elicitation study (N=6) to inform the design objectives of such EI communication augmentation tools. We implemented and deployed the tool as a Chromium browser extension and further evaluated it through a user study (N=12). This work represents a significant step toward democratizing access to environmental impact information for the general public with zero LCA expertise.

![Living Sustainability](/figures/Teaser.jpg)
---

For more information, read the full paper published in [IMWUT 2025](https://dl.acm.org/doi/abs/10.1145/3749488).

## System Overview
Living Sustainability is an autonomous system that creates interactive, in-context environmental impact visualizations from natural language. The system empowers non-technical users to understand EIs without requiring LCA expertise. Users simply input text they are interested in, and the system employs multi-step planning, automatically processing the text through four steps that emulate expert LCA workflows: 1) classifies text into relevant life cycle stages, 2) extracts key LCA parameters and transforms them into a data abstraction for LCA, 3) retrieves emission factors from authenticated LCA databases and online sources including academic research papers, and 4) conducts life cycle assessment and generates embedded interactive visualizations.
The resulting visualizations support dynamic parameter manipulation and provide transparency through detailed methodology and functional unit explanations, and data source attribution. 

![Living Sustainability](/figures/system_overview.png)

Our system consists of a Chromium extension front end developed in HTML, CSS, and JavaScript, complemented by a Node.js backend server deployed on a virtual machine. We implemented this architecture because Chromium blocks local backend operations and cannot securely store such credentials on the client side. The backend manages secure API communications and coordinates our autonomous EI modeling pipeline.

<img src="/figures/Implementation.jpg" alt="Implementation" style="width: 50%;"> 


## Getting Started
This project is subject to a pending U.S. patent (currently a provisional patent application). We have released this demo version to allow the community to explore and experiment with the technology.

**Important**: This repository contains 3 separate projects that must be deployed independently. Running everything from this single repository will not work. This repo is a compilation of 3 distinct projects that need to be deployed as separate services.

### Project Structure

**Deployment Requirements**: You need to deploy each project separately:

1. **Deploy the Node.js backend** (`/back_end_js`) as a standalone service
2. **Deploy the Python backend** (`/back_end_py`) as a standalone service  
3. **Deploy the frontend** (`/front_end`) and configure it with the backend URLs

**Frontend Configuration**: After deploying both backends (see specific instructions in `/back_end_js/README.md` and `/back_end_py/README.md`), create a `.env` file in the frontend directory with the following environment variables:

- `LCA_SERVER_URL` → URL of your deployed Node.js server
- `LCA_PY_SERVER_URL` → URL of your deployed Python server

1. **Backend JavaScript** (`/back_end_js`):
   - Node.js server that handles the core LCA processing pipeline (raw materials, freight, electronic devices footprint calculation)

2. **Backend Python** (`/back_end_py`):
   - Python-based components for handling electricity footprint calculation

3. **Frontend** (`/front_end`):
   - Chromium browser extension built with HTML, CSS, and JavaScript
   - Provides the user interface for inputting natural language descriptions
   - Displays interactive environmental impact visualizations
   - Manages user interactions and communicates with the backend services

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/iamZhihanZhang/Living-Sustainability
   ```

2. **Backend Setup**:
   ```sh
   # For Node.js backend
   cd back_end_js
   npm install
   
   # For Python backend (if applicable)
   cd ../back_end_py
   pip install -r requirements.txt
   ```

3. **Frontend Setup**:
   ```sh
   cd front_end
   npm install
   ```

4. **Environment Configuration**:
   - Set up your API keys and environment variables as needed
   - Configure database connections and external service integrations

## Cite Living Sustainability
```
@article{10.1145/3749488,
author = {Zhang, Zhihan and Thavikulwat, Puvarin and Metzger, Alexander Le and Mei, Yuxuan and H\"{a}hnlein, Felix and Englhardt, Zachary and Abowd, Gregory D. and Patel, Shwetak and Schulz, Adriana and Cheng, Tingyu and Iyer, Vikram},
title = {Living Sustainability: In-Context Interactive Environmental Impact Communication},
year = {2025},
issue_date = {September 2025},
publisher = {Association for Computing Machinery},
address = {New York, NY, USA},
volume = {9},
number = {3},
url = {https://doi.org/10.1145/3749488},
doi = {10.1145/3749488},
journal = {Proc. ACM Interact. Mob. Wearable Ubiquitous Technol.},
month = sep,
articleno = {153},
numpages = {42},
keywords = {AI Agents, AI for Sustainability, Augmented Communication, Life Cycle Assessment, Sustainable Computing}
}
```