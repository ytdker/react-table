import React, { Component } from 'react'
import { GetEventDetails } from './Helper';

export default class DetailPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            details: {}
        }

        this.dataManipulation = this.dataManipulation.bind(this);
    }

    render() {
        return <div className="container">
            <h3><a href="/" type="button" className="btn btn-secondary">ᐊ Back to events</a><span>Event Details</span></h3>
            <div className="row">
                {
                    this.state.loading ? <div className="col"> Loading... </div> :
                        <div className="col">
                            <div className="row">
                                <div className="col">
                                    <img src={this.state.details.imageUrl} className="img-fluid" alt="Responsive image" />
                                </div>
                                <div className="col">
                                    <StandardInfo type="Name" value={this.state.details.name} />
                                    <StandardInfo type="Date" value={this.state.details.date + " | " + this.state.details.timezone} />
                                    <StandardLink text="More info" url={this.state.details.url} />
                                </div>
                            </div>
                            <div className="clearfix" />

                            {
                                this.state.details.priceRanges.lenght ?
                                    <div className="row new-line" >
                                        <div className="col">
                                            <PriceRange data={this.state.details.priceRanges} />
                                        </div>
                                    </div> : null
                            }

                            <div className="clearfix" />
                            {
                                this.state.details.info ?
                                    <div className="row new-line">
                                        <div className="col">
                                            <LongInfo value={this.state.details.info} />
                                        </div>
                                    </div> : null
                            }

                            {
                                this.state.details.pleaseNote ?
                                    <div className="row new-line">
                                        <div className="col">
                                            <NoteInfo text="Please Note" value={this.state.details.pleaseNote} />
                                        </div>
                                    </div> : null
                            }

                        </div>
                }
            </div>
        </div>
    }

    componentDidMount() {
        GetEventDetails(this.props.match.params.id).then(
            (data) => {
                this.dataManipulation(data);
            },
            () => {
                //TODO Error handling
                this.setState({ loading: false });
            }
        );
    }

    dataManipulation(data) {

        let details = {
            imageUrl: data.images[0].url,
            info: data.info,
            name: data.name,
            date: data.dates.start ? [data.dates.start.localDate, data.dates.start.localTime].join(" ") : null,
            timezone: data.dates.timezone,
            pleaseNote: data.pleaseNote,
            priceRanges: data.priceRanges || [],
            url: data.url
        };

        this.setState({ details: details, loading: false });
    }
}

const StandardInfo = (props) => <div className="row">
    <div className="col">
        <strong>{props.type}:</strong> {props.value}
    </div>
</div>

const LongInfo = (props) => <div className="border">
    {props.value}
</div>

const NoteInfo = (props) => <div className="border note">
    <samp><strong>{props.text}:</strong> {props.value}</samp>
</div>

const StandardLink = (props) => <div className="row">
    <div className="col">
        <a href={props.url} target="_blank" type="button">{props.text}</a>
    </div>
</div>

const PriceRange = (props) => <ul className="list-group">
    <li className="list-group-item active">Price Range</li>
    {props.data.map((p, i) => <li key={i} className="list-group-item">
        {p.min == p.max ?
            <p>{p.min} {p.currency} ({p.type})</p>
            : <p>{p.min} {p.currency} - {p.max} {p.currency}  ({p.type})</p>}
    </li>)}
</ul>