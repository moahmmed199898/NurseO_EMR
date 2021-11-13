import { findIndex } from 'lodash';
import React, { ChangeEvent } from 'react';
import PureModal from 'react-pure-modal';
import 'react-pure-modal/dist/react-pure-modal.min.css';
import Database from '../../Services/Database';
import { $patient } from '../../Services/State';
import { MedicationOrder, PatientChart } from '../../Types/PatientProfile';
import EmptyCard from '../Dashboard/Card/EmptyCard';

type Props = {
    patient: PatientChart
}

type State = {
    medicationID: string
    scannedMedicationOrder: MedicationOrder | undefined
    scannedMedicationName: string,
    dose: string,
}
export default class AdministerMeds extends React.Component<Props,State> {

    constructor(props:Props) {
        super(props);
        this.state = {
            medicationID: "",
            scannedMedicationOrder: undefined,
            scannedMedicationName: "",
            dose: ""
        }
    }

    onIDChangeHandler(event:ChangeEvent<HTMLInputElement>) {
        this.setState({
            medicationID: event.target.value
        })
    }

    onDoseChangeHandler(event:ChangeEvent<HTMLInputElement>) {
        this.setState({
            dose: event.target.value
        })
    }

    async onScanHandler() {
        const db = Database.getInstance();
        const patient = $patient.value;
        const medIndex = this.getMedIndex(patient!.medications);
        if(medIndex>-1) {
            const med = await db.getMedication(patient!.medications[medIndex].id);
            this.setState({
                scannedMedicationOrder: patient?.medications[medIndex],
                scannedMedicationName:med!.name
            });
            
        }
        
    }

    async onSubmit() {
        const db = Database.getInstance();
        const patient = $patient.value!;
        const medications = patient.medications;
        const medIndex = this.getMedIndex(medications)
        if(medIndex>-1) {
            const time = patient.time.split(":");
            patient.medications[medIndex].mar.push({
                hour: Number.parseInt(time[0]),
                minutes: Number.parseInt(time[1])
            })
            $patient.next(patient);
            await db.updatePatient()
            this.setState({
                medicationID: "",
                scannedMedicationName: "",
                scannedMedicationOrder: undefined,
                dose: "",
            })
        }
    }

    onModalClose() {
        this.setState({
            scannedMedicationOrder: undefined,
            scannedMedicationName: ""
        })
    }

    getMedIndex(medications:MedicationOrder[]) {
        return findIndex(medications, {id: this.state.medicationID});
    }

    public render() {
        return (
            <>
                <EmptyCard title="Administer Medications" className="text-center">
                    <h1 className="font-bold p-10 text-4xl">
                        Please scan the medication you wish to administer
                    </h1>
                    <input type="text" className="border-red-700 border-2 rounded-full w-1/2 h-10 block mx-auto text-center"
                    placeholder="click here to scan the medication barcode" autoFocus onChange={this.onIDChangeHandler.bind(this)} value={this.state.medicationID}/>
                    <button className="text-white bg-red-700 px-20 py-2 rounded-full mt-5" onClick={this.onScanHandler.bind(this)}>Administer</button>
                </EmptyCard>

                <PureModal isOpen={!!this.state.scannedMedicationName} header={`Administer ${this.state.scannedMedicationName}`}
                 draggable={true} onClose={this.onModalClose.bind(this)} className="text-center" width="60vw">
                     <div>
                        <h1 className="font-bold text-xl py-6">
                            {this.state.scannedMedicationName}{" "}
                            {this.state.scannedMedicationOrder?.concentration}{" "}
                            {this.state.scannedMedicationOrder?.route}{" "}
                            {this.state.scannedMedicationOrder?.frequency} {" "}
                            {this.state.scannedMedicationOrder?.routine}  {" "}
                            {this.state.scannedMedicationOrder?.PRNNote}{" "}
                            {this.state.scannedMedicationOrder?.notes}{" "}
                        </h1>
                        <div>
                            <label className="block text-red-700 font-bold text-lg tracking-wide pb-4" htmlFor="dose">
                                Please State your dose or rate with unites (ex: 100ml/hr or 20mg)
                            </label>
                            <input className="border-2 border-red-700 rounded-full text-center h-10 w-1/2 mb-4" onChange={this.onDoseChangeHandler.bind(this)}
                             autoFocus type="text" id="dose" placeholder="Dose or Rate" />
                        </div>
                        <button className="bg-red-700 text-white py-4 px-16 rounded-full font-bold" onClick={this.onSubmit.bind(this)}>Submit</button>
                    </div>
                </PureModal>
            </>
        );
    }
}

