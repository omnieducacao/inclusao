#!/usr/bin/env python3
"""
Batch add aria-labels to buttons in Omnisfera components.
Analyzes context to determine appropriate labels.
"""
import re
import os

# Map of component files and their button contexts
# Format: (file, pattern_before_button, aria_label)
ARIA_FIXES = [
    # GlobalSearch
    ("components/GlobalSearch.tsx", 'onClick={() => setIsOpen(true)}', 'aria-label="Buscar na plataforma"'),
    ("components/GlobalSearch.tsx", 'onClick={() => setIsOpen(false)}', 'aria-label="Fechar busca"'),
    
    # SimulationBanner
    ("components/SimulationBanner.tsx", 'onClick={handleExit}', 'aria-label="Sair da simulação"'),
    
    # MemberSimulationBanner
    ("components/MemberSimulationBanner.tsx", 'onClick={handleExit}', 'aria-label="Sair da simulação de membro"'),
    
    # GuidedTour
    ("components/GuidedTour.tsx", 'onClick={handleDismiss}', 'aria-label="Fechar tour guiado"'),
    ("components/GuidedTour.tsx", 'onClick={handlePrev}', 'aria-label="Passo anterior"'),
    ("components/GuidedTour.tsx", 'onClick={handleNext}', 'aria-label="Próximo passo"'),
    ("components/GuidedTour.tsx", 'onClick={handleComplete}', 'aria-label="Concluir tour"'),
    
    # ImageCropper
    ("components/ImageCropper.tsx", 'onClick={onClose}', 'aria-label="Fechar editor de imagem"'),
    
    # DataCleanupPanel
    ("components/DataCleanupPanel.tsx", 'onClick={handleCleanup}', 'aria-label="Executar limpeza de dados"'),
    
    # PdfDownloadButton
    ("components/PdfDownloadButton.tsx", 'onClick={handleDownload}', 'aria-label="Baixar PDF"'),
    
    # DocxDownloadButton
    ("components/DocxDownloadButton.tsx", 'onClick={handleDownload}', 'aria-label="Baixar DOCX"'),
    
    # SafeModuleWrapper
    ("components/SafeModuleWrapper.tsx", 'onClick={() => setHasError(false)}', 'aria-label="Tentar novamente"'),
    
    # Toast
    ("components/Toast.tsx", 'onClick={onClose}', 'aria-label="Fechar notificação"'),
    
    # HomeFeed
    ("components/HomeFeed.tsx", 'onClick={() => setExpanded', 'aria-label="Expandir atividades"'),
]

def add_aria_labels():
    """Add aria-label to buttons that don't have one."""
    modified = 0
    for filepath, pattern, aria_attr in ARIA_FIXES:
        if not os.path.exists(filepath):
            print(f"  SKIP: {filepath} not found")
            continue
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        # Check if this aria-label already exists
        if aria_attr in content:
            print(f"  OK: {filepath} already has {aria_attr}")
            continue
        
        # Find the pattern and add aria-label after the onClick
        if pattern in content:
            # Add aria-label right after the onClick attribute
            new_content = content.replace(
                pattern,
                f'{pattern}\n                {aria_attr}',
                1  # Only first occurrence
            )
            
            if new_content != content:
                with open(filepath, 'w') as f:
                    f.write(new_content)
                modified += 1
                print(f"  ✅ {filepath}: added {aria_attr}")
            else:
                print(f"  ⚠️ {filepath}: pattern found but no change")
        else:
            print(f"  ⚠️ {filepath}: pattern '{pattern[:40]}...' not found")
    
    print(f"\nModified {modified} files")

if __name__ == "__main__":
    add_aria_labels()
