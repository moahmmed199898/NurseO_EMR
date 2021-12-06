import React from 'react';


type Props = React.HTMLProps<HTMLInputElement> & {
    id: string,
};
export default class Input extends React.Component<Props> {

    public render() {	
        return (
            <div className="grid grid-cols-4 w-5/12 my-2 items-center">
                <label htmlFor={this.props.id} className="font-bold">{this.props.children}</label>
                <input onChange={this.props.onChange} className="border-2 border-red-700 rounded-full ml-6 text-center col-span-3"
                 id={this.props.id} type={this.props.type} value={this.props.value}/> 
            </div>
        );
    }	
}