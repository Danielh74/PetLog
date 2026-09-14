import React from 'react';
import type { HealthRecord } from '../../types';

interface FormProps {
    formTitle: string;
    children: React.ReactNode;
    onCancel: () => void;
    onSave: () => void;
    initial?: HealthRecord | undefined
}

function Form({ formTitle, children, onCancel, onSave, initial }: FormProps) {
    return (
        <div>
            <div className="sheet-title">{formTitle}</div>
            <div className="sheet-body">
                {children}
                <div className="sheet-actions">
                    <button className="btn btn-outline" onClick={onCancel}>
                        {initial ? 'Cancel' : 'Back'}
                    </button>
                    <button className="btn btn-primary" onClick={onSave}>
                        Save
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Form