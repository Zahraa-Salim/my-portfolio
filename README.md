# Zahraa Salim – Developer Portfolio

This is a modern, responsive developer portfolio built with React and Vite.
It showcases my projects, technical skills, and professional profile, with live data fetched directly from GitHub.

# Overview

The portfolio dynamically loads my GitHub repositories and presents them in a clean, professional interface. Each project can be opened in a modal to view detailed information and the full README rendered from Markdown.

This project focuses on strong UI structure, performance, and user experience.

# Features
## Dynamic GitHub Projects

Fetches repositories using the GitHub REST API

Displays projects in responsive cards

Sorts by most recently updated

Excludes forked repositories

Supports pagination with Show More / Show Less

## Project Details Modal

Each project opens in an interactive modal that includes:

Technologies used (language and repository topics)

Direct link to the GitHub repository

Live demo link (if provided)

Full README preview rendered from Markdown

UTF-8 decoding to properly display emojis and symbols

ESC key and outside click to close

Background scroll lock for better user experience

## Markdown Rendering

README files are rendered using:

react-markdown

remark-gfm (GitHub Flavored Markdown)

Custom styling is applied for headings, paragraphs, lists, links, and code blocks.

## Hero Section

The hero section introduces my profile with:

Animated typewriter role effect

Responsive layout for mobile and desktop

Profile image with fallback initials

Quick contact links (Email, GitHub, LinkedIn)

“View CV” button that opens a CV modal

## Navigation Behavior

The navigation bar includes advanced behavior:

Appears only after scrolling past the hero section

Automatically hides when a modal is open

Responsive mobile menu

Prevents background scroll when the mobile menu is open

Closes on screen resize and ESC key

## Responsive Design

The portfolio is fully responsive and optimized for:

Mobile devices, Tablets, Desktop screens

Layout and spacing are handled using Tailwind CSS utility classes.

# Tech Stack

Frontend: React (Vite)
Styling: Tailwind CSS
Data Source: GitHub REST API
Markdown Rendering: react-markdown, remark-gfm
State Management: React Hooks

# Technical Highlights

Clean and modular component structure

Reusable UI components

API error handling and loading states

Optimized modal performance

Accessibility support (keyboard and focus handling)

Smooth animations with minimal performance impact