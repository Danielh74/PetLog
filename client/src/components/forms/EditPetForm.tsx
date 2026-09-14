import { useState } from 'react'
import type { UpdatePetInput } from '../../api/pets';
import type { Pet, Species } from '../../types';
import DateInput from '../DateInput';
import Form from './Form';

const SPECIES_LABELS: Record<Species, string> = {
    dog: 'Dog',
    cat: 'Cat',
    bird: 'Bird',
    rabbit: 'Rabbit',
    other: 'Other',
};

function EditPetForm({
    pet,
    onCancel,
    onSaved,
}: {
    pet: Pet;
    onCancel: () => void;
    onSaved: (input: UpdatePetInput) => void;
}) {
    const [name, setName] = useState(pet.name);
    const [species, setSpecies] = useState<Species>(pet.species);
    const [breed, setBreed] = useState(pet.breed ?? '');
    const [dob, setDob] = useState(pet.dob ?? '');

    const submit = () => {
        onSaved({
            name: name.trim(),
            species,
            breed: breed.trim() || undefined,
            // updatePetSchema wants z.iso.date(), a calendar day with no time. The
            // pet arrives from the API as a full ISO datetime, so trim it back —
            // otherwise saving without touching the birthday field returns a 400.
            ...(dob && { dob: dob.slice(0, 10) }),
        });
    };

    return (
        <div>
            <Form
                formTitle='Edit pet'
                onCancel={onCancel}
                onSave={submit}>
                <div className="field">
                    <label>Name</label>
                    <input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="field">
                    <label>Species</label>
                    <select value={species} onChange={(e) => setSpecies(e.target.value as Species)}>
                        {Object.entries(SPECIES_LABELS).map(([id, label]) => (
                            <option key={id} value={id}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="field">
                    <label>Breed</label>
                    <input value={breed} onChange={(e) => setBreed(e.target.value)} />
                </div>
                <DateInput label="Birthday" value={dob} onChange={setDob} />
            </Form>
        </div>
    );
}

export default EditPetForm