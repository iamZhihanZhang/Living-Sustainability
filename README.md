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

1. **Back end** (`/back_end`):

2. **Front end** (`/front_end`):
   - Contains code for the Chromium extension front end

### Installation

1. Clone the repo
   ```sh
   git clone https://github.com/iamZhihanZhang/Living-Sustainability
   ```

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