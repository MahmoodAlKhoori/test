# Supplier Assurance Platform

A comprehensive enterprise supplier risk management and security assessment platform built with Next.js, TypeScript, and Tailwind CSS.

## Features

### Core Functionality
- **Supplier Management**: Add and manage supplier profiles with contact information
- **Service Assessment**: Detailed 8-question risk scoring system with weighted calculations
- **Workflow Management**: Draft → Pending Manager Review → Approved workflow with role-based permissions
- **External Integration**: SecurityScorecard API integration for external security ratings
- **Risk Calculation**: Automated risk level and review frequency determination

### Scoring System
The platform uses an 8-factor weighted scoring system:
- **Confidentiality** (20%): Data sensitivity assessment
- **Integrity of Data** (20%): Data accuracy and completeness requirements
- **Availability Requirement** (20%): System uptime and availability needs
- **Integration/Level of Access** (20%): Supplier system access levels
- **Reputational Impact** (5%): Company reputation risk
- **Regulatory Impact** (5%): Compliance and regulatory considerations
- **Financial Impact** (5%): Potential financial exposure
- **Customer Service Impact** (5%): Effect on customer service delivery

### Risk Levels & Review Frequencies
- **Very High** (≥4.0): Annual review
- **High** (≥3.0): Annual review  
- **Medium** (≥2.0): Review every 2 years
- **Low** (<2.0): Review every 3 years

### User Roles
- **User**: Can create suppliers, add/edit services in Draft state, send for review
- **Manager**: All User permissions plus ability to approve services in Pending state

## Getting Started

1. The application loads with pre-seeded dummy data including:
   - Microsoft (with O365 and Viva Insights services)
   - Amazon Web Services (with S3 service)

2. Use the role toggle in the header to switch between User and Manager permissions

3. Navigate through the application:
   - **Suppliers List**: Overview of all suppliers with risk indicators
   - **Supplier Detail**: Comprehensive dashboard with internal/external assessments
   - **Service Forms**: Detailed risk assessment with live calculations

## Technical Architecture

- **Frontend**: Next.js 14 with App Router, React 18, TypeScript
- **State Management**: Zustand for client-side state
- **Styling**: Tailwind CSS v4 with custom design tokens
- **UI Components**: Radix UI primitives with custom styling
- **API Simulation**: Mock SecurityScorecard integration with realistic data

## Design System

The platform uses a dark enterprise theme inspired by modern B2B dashboards:
- **Primary Colors**: Professional grays and whites for enterprise feel
- **Accent Colors**: Risk-based color coding (red, orange, yellow, green)
- **Typography**: Clean, readable fonts optimized for data-heavy interfaces
- **Layout**: Responsive design with card-based information architecture

## Demo Data

The application includes realistic demo data matching enterprise scenarios:
- Microsoft services with high-risk O365 implementation
- AWS services with medium-risk S3 storage
- Various workflow states demonstrating approval processes
- External security scorecards with realistic grades and factors
