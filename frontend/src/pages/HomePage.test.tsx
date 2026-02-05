/**
 * Tests for HomePage component.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';

const renderHomePage = () =>
    render(
        <MemoryRouter>
            <HomePage />
        </MemoryRouter>
    );

describe('HomePage', () => {
    it('renders the title', () => {
        renderHomePage();
        expect(screen.getByText('QKD Simulator')).toBeInTheDocument();
    });

    it('renders protocol cards', () => {
        renderHomePage();
        expect(screen.getByText('BB84 Protocol')).toBeInTheDocument();
        expect(screen.getByText('E91 Protocol')).toBeInTheDocument();
    });

    it('renders the AES encryption card', () => {
        renderHomePage();
        expect(screen.getByText('AES Encryption Tool')).toBeInTheDocument();
    });

    it('renders the history card', () => {
        renderHomePage();
        expect(screen.getByText('Simulation History')).toBeInTheDocument();
    });

    it('renders simulation features section', () => {
        renderHomePage();
        expect(screen.getByText('Simulation Features')).toBeInTheDocument();
        expect(screen.getByText('Real Quantum Circuits')).toBeInTheDocument();
        expect(screen.getByText('Eve Detection')).toBeInTheDocument();
        expect(screen.getByText('Key Generation')).toBeInTheDocument();
    });

    it('renders stats section', () => {
        renderHomePage();
        expect(screen.getByText('2')).toBeInTheDocument(); // Protocols
        expect(screen.getByText('20+')).toBeInTheDocument(); // Qubits
    });
});
