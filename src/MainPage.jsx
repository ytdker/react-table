import React, { Component } from 'react'
import { GetEvents, GetEventsByUrl } from './Helper';

export default class MainPage extends Component {
    constructor(props) {
        super(props);

        let lastSearch = sessionStorage.getItem('lastSearch');
        let lastSortBy = sessionStorage.getItem('lastSortBy') || "name,asc";//name,asc | name,desc | date,asc | date,desc
        let lastPaging = sessionStorage.getItem('lastPaging');


        this.state = {
            loading: false,
            lastSearch: lastSearch,
            eventsInfoList: [],
            links: null,
            lastSortBy: lastSortBy,
            lastPaging: lastPaging
        }

        this.SearchTimer = null;

        this.onChangeEvent = this.onChangeEvent.bind(this);
        this.getEventsData = this.getEventsData.bind(this);
        this.getEventsDataByUrl = this.getEventsDataByUrl.bind(this);
        this.onClickPaging = this.onClickPaging.bind(this);
        this.onClickSortBy = this.onClickSortBy.bind(this);
        this.clearData = this.clearData.bind(this);

    }

    render() {
        return <div className="container">
            <TableSearch onChange={this.onChangeEvent} defaultValue={this.state.lastSearch} searching={this.state.loading} />
            <TableHeader onClick={this.onClickSortBy} lastSortBy={this.state.lastSortBy} />
            {
                this.state.loading ? <TableLoading colSpan="4" /> :
                    !this.state.lastSearch ? <TableSearchIsEmpty colSpan="4" /> :
                        <TableBody rowData={this.state.eventsInfoList} />
            }


            <TablePagination
                onClickFirst={() => this.onClickPaging("first")}
                onClickPrev={() => this.onClickPaging("prev")}
                onClickNext={() => this.onClickPaging("next")}
                onClickLast={() => this.onClickPaging("last")}
                disabledPrev={this.state.links == null ? true : !this.state.links["prev"]}
                disabledNext={this.state.links == null ? true : !this.state.links["next"]}
            />

        </div>
    }

    componentDidMount() {
        if (this.state.lastPaging)
            this.getEventsDataByUrl(this.state.lastPaging);
        else if (this.state.lastSearch)
            this.getEventsData(this.state.lastSearch, this.state.lastSortBy);
    }

    getEventsData(searchKeyword, sortBy) {
        if (searchKeyword) {
            GetEvents(PageSize, searchKeyword, sortBy).then(
                (data) => {
                    this.dataManipulation(data);
                },
                () => {
                    this.setState({ loading: false });
                });
        }
    }

    getEventsDataByUrl(paging) {
        GetEventsByUrl(paging).then(
            (data) => { this.dataManipulation(data); },
            () => {
                this.setState({ loading: false });
            }
        );
    }

    dataManipulation(data) {
        if (data._embedded) {
            let page = data.page;
            let events = data._embedded.events;
            let links = data._links;

            let eventsInfoList = [];

            events.forEach(e => {
                let date = e.dates.start ? e.dates.start.localDate + " " + (e.dates.start.localTime || "") : null;
                eventsInfoList.push({
                    id: e.id,
                    name: e.name,
                    imageUrl: e.images && e.images.length > 0 ? e.images[0].url : null,
                    url: e.url,
                    date: date
                });
            });

            this.setState({ eventsInfoList: eventsInfoList, links: links, loading: false });
        }
        else {
            this.clearData();
        }

    }

    clearData() {
        sessionStorage.removeItem('lastSearch');
        sessionStorage.removeItem('lastSortBy');
        sessionStorage.removeItem('lastPaging');

        this.setState({
            loading: false,
            eventsInfoList: [],
            lastPaging: "",
            lastSearch: "",
            lastSortBy: "name,asc",
            links: null
        });

    }

    onChangeEvent(e) {
        let searchKeyword = e.target.value.trim();

        if (this.SearchTimer)
            clearTimeout(this.SearchTimer);

        if (searchKeyword) {
            this.SearchTimer = setTimeout(() => {
                this.setState({ loading: true, lastSearch: searchKeyword }, () => {
                    this.getEventsData(searchKeyword, this.state.lastSortBy);
                });
            }, 1500);

            sessionStorage.setItem('lastSearch', searchKeyword);
        }
        else {
            this.clearData();
        }


    }

    onClickPaging(state) {
        var link = this.state.links[state];
        let paging = link.href.split("?")[1];
        this.state.lastPaging = paging;
        this.getEventsDataByUrl(paging);
        sessionStorage.setItem('lastPaging', paging);
    }

    onClickSortBy(sortBy) {

        if (this.state.lastSortBy.includes("asc")) {
            sortBy += ",desc";
        }
        else {
            sortBy += ",asc";
        }

        this.setState({ lastSortBy: sortBy, loading: true }, () => {
            this.getEventsData(this.state.lastSearch, this.state.lastSortBy);
            sessionStorage.setItem('lastSortBy', sortBy);
        });
    }
}



function TableHeader(props) {

    let sortIcon = null;
    if (props.lastSortBy.includes("asc")) {
        sortIcon = "ᐁ"
    }
    else {
        sortIcon = "ᐃ"
    }

    let isName = props.lastSortBy.includes("name");


    return <table className="table"><thead>
        <tr>
            <th scope="col" style={{ width: "10%" }}></th>
            <th scope="col" style={{ width: "60%" }}>
                <button type="button" className="btn btn-link only-link" onClick={() => props.onClick("name")}>Name {isName ? sortIcon : ""}</button>
            </th>
            <th scope="col" style={{ width: "20%" }}>
                <button type="button" className="btn btn-link only-link" onClick={() => props.onClick("date")}>Date {!isName ? sortIcon : ""}</button>
            </th>
            <th scope="col" style={{ width: "10%" }}>Action</th>
        </tr>
    </thead>
    </table>
}


const TableBody = (props) => <div className="autoScroll"> <table className="table table-hover">
    <tbody>
        {props.rowData.map(rd => <TableRow key={rd.id} data={rd} />)}
    </tbody>
</table>
</div>

const TableRow = ({ data, ...props }) => <tr>
    <td style={{ width: "10%" }}>{data.imageUrl ? <img src={data.imageUrl} width="50" /> : "No Img"}</td>
    <td style={{ width: "60%" }}>{data.url ? <a href={data.url} target="_blank">{data.name}</a> : data.name}</td>
    <td style={{ width: "20%" }}>{data.date}</td>
    <td style={{ width: "10%" }}><a href={"details/" + data.id} type="button" className="btn btn-link">Details</a></td>
</tr>

const TablePagination = (props) => <div>
    <div className="btn-group mr-2 pull-right" role="group" aria-label="First group">
        <button type="button" className="btn btn-secondary" onClick={props.onClickFirst} disabled={props.disabledPrev}>First</button>
        <button type="button" className="btn btn-secondary" onClick={props.onClickPrev} disabled={props.disabledPrev}>Prev</button>
        <button type="button" className="btn btn-secondary" onClick={props.onClickNext} disabled={props.disabledNext}>Next</button>
        <button type="button" className="btn btn-secondary" onClick={props.onClickLast} disabled={props.disabledNext}>Last</button>
    </div>
</div>

const TableSearchIsEmpty = (props) => <table><tbody><tr><td colSpan={props.colSpan}>Let's search for new events...</td></tr></tbody></table>
const TableLoading = (props) => <table><tbody><tr><td colSpan={props.colSpan}>Loading...</td></tr></tbody></table>
const TableSearch = (props) => <div className="input-group input-group-sm mb-3">
    <div className="input-group-prepend">
        <span className="input-group-text" id="inputGroup-sizing-sm">{props.searching ? "Searching..." : "Search Event"}</span>
    </div>
    <input type="text" className="form-control" defaultValue={props.defaultValue}
        aria-label="Small" aria-describedby="inputGroup-sizing-sm"
        onChange={props.onChange} disabled={props.searching} autoFocus />
</div>
const PageSize = 10;