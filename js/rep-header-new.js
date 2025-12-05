/**
 * REPRESENTATIVE HEADER - REBUILT FROM SCRATCH
 * V36.11.8 - Maximum contrast, no conflicts
 * 
 * Design principles:
 * - WCAG AAA contrast (7:1 minimum)
 * - No gradients on stat boxes
 * - Solid colors only
 * - Text shadows for extra clarity
 */

function createRepresentativeHeader(counts, sources, totalReps) {
    const federal = counts.federal || 0;
    const state = counts.state || 0;
    const local = counts.local || 0;
    
    return `
        <div style="
            background: linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%);
            padding: 2rem;
            border-radius: 12px;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(91, 33, 182, 0.3);
        ">
            <!-- Title -->
            <h3 style="
                margin: 0 0 1.5rem 0;
                font-size: 1.75rem;
                font-weight: 700;
                color: #ffffff;
                text-shadow: 0 2px 4px rgba(0,0,0,0.4);
                display: flex;
                align-items: center;
                gap: 0.75rem;
            ">
                <span style="font-size: 2rem;">🎯</span>
                Found ${totalReps} Representative${totalReps !== 1 ? 's' : ''}
            </h3>
            
            <!-- Statistics Grid -->
            <div style="
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
                gap: 1rem;
                margin-bottom: 1.5rem;
            ">
                ${federal > 0 ? `
                    <div style="
                        background: #1e3a8a;
                        padding: 1.25rem;
                        border-radius: 10px;
                        text-align: center;
                        border: 3px solid #3b82f6;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">
                        <div style="
                            font-size: 2.5rem;
                            font-weight: 800;
                            color: #ffffff;
                            line-height: 1;
                            margin-bottom: 0.5rem;
                            text-shadow: 0 2px 6px rgba(0,0,0,0.5);
                        ">${federal}</div>
                        <div style="
                            font-size: 0.875rem;
                            font-weight: 700;
                            color: #ffffff;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                        ">Federal</div>
                    </div>
                ` : ''}
                
                ${state > 0 ? `
                    <div style="
                        background: #581c87;
                        padding: 1.25rem;
                        border-radius: 10px;
                        text-align: center;
                        border: 3px solid #a855f7;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">
                        <div style="
                            font-size: 2.5rem;
                            font-weight: 800;
                            color: #ffffff;
                            line-height: 1;
                            margin-bottom: 0.5rem;
                            text-shadow: 0 2px 6px rgba(0,0,0,0.5);
                        ">${state}</div>
                        <div style="
                            font-size: 0.875rem;
                            font-weight: 700;
                            color: #ffffff;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                        ">State</div>
                    </div>
                ` : ''}
                
                ${local > 0 ? `
                    <div style="
                        background: #065f46;
                        padding: 1.25rem;
                        border-radius: 10px;
                        text-align: center;
                        border: 3px solid #10b981;
                        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
                    ">
                        <div style="
                            font-size: 2.5rem;
                            font-weight: 800;
                            color: #ffffff;
                            line-height: 1;
                            margin-bottom: 0.5rem;
                            text-shadow: 0 2px 6px rgba(0,0,0,0.5);
                        ">${local}</div>
                        <div style="
                            font-size: 0.875rem;
                            font-weight: 700;
                            color: #ffffff;
                            text-transform: uppercase;
                            letter-spacing: 0.05em;
                            text-shadow: 0 1px 3px rgba(0,0,0,0.4);
                        ">Local</div>
                    </div>
                ` : ''}
            </div>
            
            <!-- Data Sources -->
            ${sources && sources.length > 0 ? `
                <div style="
                    font-size: 0.875rem;
                    color: #ffffff;
                    font-weight: 600;
                    display: flex;
                    align-items: center;
                    gap: 0.75rem;
                    flex-wrap: wrap;
                    text-shadow: 0 1px 3px rgba(0,0,0,0.3);
                ">
                    <span style="opacity: 0.9;">✓ Data Sources:</span>
                    ${sources.map(source => `
                        <span style="
                            background: #1e293b;
                            padding: 0.375rem 0.875rem;
                            border-radius: 8px;
                            border: 2px solid #475569;
                            font-weight: 700;
                            text-shadow: none;
                        ">${source}</span>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

// Export for use in rep-finder-simple.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createRepresentativeHeader };
}
