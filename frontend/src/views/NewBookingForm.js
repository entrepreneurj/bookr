import React from "react";

import __fetch from "isomorphic-fetch";
import moment from "moment";

import AuthStore from "../stores/AuthStore";
import { API } from "../utils/api_info";

import BookingActions from "../actions/BookingActions";
import BookingPartActions from "../actions/BookingPartActions";

import BookingStore from "../stores/BookingStore";
import BookingPartStore from "../stores/BookingPartStore";

export default class NewBookingForm extends React.Component {
	constructor (props) {
		super(props);
		this.state = {
			booking: {
				name: '',
				description: '',
				type: 'booking'
			},
			bookingPart: {
				startDate: '',
				endDate: ''
			},
			disabled: false,
			errors: {
				booking: BookingStore.getCreateErrors(),
				bookingPart: BookingPartStore.getCreateErrors()
			}
		};

		this.handleChangeBookingName = this.handleChangeBookingName.bind(this);
		this.handleChangeBookingDescription = this.handleChangeBookingDescription.bind(this);
		this.handleChangeBookingPartStartDate = this.handleChangeBookingPartStartDate.bind(this);
		this.handleChangeBookingPartEndDate = this.handleChangeBookingPartEndDate.bind(this);
		this.handleChangeBookingType = this.handleChangeBookingType.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);

		this.onStoreChange = this.onStoreChange.bind(this);
	}

	componentWillMount() {
		BookingStore.addChangeListener(this.onStoreChange);
		BookingPartStore.addChangeListener(this.onStoreChange);
	}

	componentWillUnmount() {
		BookingStore.removeChangeListener(this.onStoreChange);
		BookingPartStore.removeChangeListener(this.onStoreChange);
	}

	hasError(thing, field) {
		return this.errors(thing, field).length > 0 || this.errors(thing, 'non_field_errors').length > 0;
	}

	errors(thing, field) {
		return this.state.errors[thing][field] ? this.state.errors[thing][field] : [];
	}

	nonFieldErrors() {
		return this.errors('booking', 'non_field_errors').concat(this.errors('bookingPart', 'non_field_errors'));
	}

	render () {
		const { bookableId } = this.props;

		return (
			<form onSubmit={this.handleSubmit}>
				{this.nonFieldErrors().length > 0 ? (
					<div className="alert alert-danger" role="alert">
						<strong>Uh oh!</strong> Looks like something went wrong:
						<ul>
						{this.nonFieldErrors().map((err) => (
							<li key={err}>{err}</li>
						))}
						</ul>
					</div>
				) : []}
				<div className={`form-group row` + (this.hasError('booking', 'name') ? ' has-error': '')}>
					<label htmlFor="inputName" className="col-sm-2 form-control-label">Booking Name</label>
					<div className="col-sm-10">
						<input type="text" required className="form-control" id="inputUsername" placeholder="My Awesome Recording" value={this.state.booking.name} onChange={this.handleChangeBookingName} disabled={this.state.disabled} />
					</div>
				</div>
				<div className={`form-group row` + (this.hasError('booking', 'description') ? ' has-error': '')}>
					<label htmlFor="inputDescription" className="col-sm-2 form-control-label">Description</label>
					<div className="col-sm-10">
						<textarea required className="form-control" id="inputDescription" placeholder="I need this space in particular because ... and I want it for this long because ..." value={this.state.booking.description} onChange={this.handleChangeBookingDescription} disabled={this.state.disabled} />
					</div>
				</div>
				{this.props.allowedEventTypes.length > 1 ? (
					<div className={`form-group row` + (this.hasError('booking', 'type') ? ' has-error': '')}>
						<label htmlFor="inputType" className="col-sm-2 form-control-label">Type</label>
						<div className="col-sm-10">
							<select required className="form-control" id="inputType" value={this.state.booking.type} onChange={this.handleChangeBookingType} disabled={this.state.disabled}>
								{this.props.allowedEventTypes.map((eventType) => (
									<option key={eventType} value={eventType}>{eventType}</option>
								))}
							</select>
						</div>
					</div>
				) : []}
				<div className={`form-group row` + (this.hasError('bookingPart', 'startDate') ? ' has-error': '')}>
					<label htmlFor="inputStartDate" className="col-sm-2 form-control-label">Start Time</label>
					<div className="col-sm-10">
						<input type="datetime-local" required className="form-control" id="inputStartDate" value={this.state.bookingPart.startDate} onChange={this.handleChangeBookingPartStartDate} disabled={this.state.disabled} />
					</div>
				</div>
				<div className={`form-group row` + (this.hasError('bookingPart', 'endDate') ? ' has-error': '')}>
					<label htmlFor="inputEndDate" className="col-sm-2 form-control-label">End Time</label>
					<div className="col-sm-10">
						<input type="datetime-local" required className="form-control" id="inputEndDate" value={this.state.bookingPart.endDate} onChange={this.handleChangeBookingPartEndDate} disabled={this.state.disabled} />
					</div>
				</div>
				<div className="form-group row">
					<div className="col-sm-offset-2 col-sm-10">
						<button className="btn btn-primary" disabled={this.state.disabled}>Make booking</button>
					</div>
				</div>
			</form>
		);
	}

	handleChangeBookingName (e) {
		this.setState({
			booking: {
				name: e.target.value,
				description: this.state.booking.description,
				type: this.state.booking.type
			}
		});
	}

	handleChangeBookingDescription (e) {
		this.setState({
			booking: {
				description: e.target.value,
				name: this.state.booking.name,
				type: this.state.booking.type
			}
		});
	}

	handleChangeBookingType (e) {
		this.setState({
			booking: {
				type: e.target.value,
				name: this.state.booking.name,
				description: this.state.booking.description
			}
		})
	}

	handleChangeBookingPartStartDate (e) {
		this.setState({
			bookingPart: {
				startDate: e.target.value,
				endDate: this.state.bookingPart.endDate
			}
		});
	}

	handleChangeBookingPartEndDate (e) {
		this.setState({
			bookingPart: {
				startDate: this.state.bookingPart.startDate,
				endDate: e.target.value
			}
		});
	}

	handleSubmit (e) {
		e.preventDefault();
		this.setState({
			disabled: true
		});

		let undisable = (inp) => {
			this.setState({
				disabled: false
			});
			return inp;
		};

		let booking = {
			type: this.state.booking.type,
			name: this.state.booking.name,
			description: this.state.booking.description
		};
		BookingActions.create(booking).then((booking) => {
			if (!booking) {
				return BookingActions.destroy(booking);
			}

			let bookingPart = {
				booking: booking.id,
				bookable: this.props.bookableId,
				booking_start: moment(this.state.bookingPart.startDate).toISOString(),
				booking_end: moment(this.state.bookingPart.endDate).toISOString()
			};
			return BookingPartActions.create(bookingPart).then((bookingPart) => {
				if (!bookingPart) {
					return BookingActions.destroy(booking);
				}

				this.onNewBookingCreated(booking, bookingPart);
			}, (err) => {
				return BookingActions.destroy(booking);
			});
		}).then(undisable, undisable);

	}

	onNewBookingCreated (booking, bookingPart) {
		if (this.props.onNewBookingCreated) {
			this.props.onNewBookingCreated(booking, bookingPart);
		}
	}

	onStoreChange () {
		this.setState({
			errors: {
				booking: BookingStore.getCreateErrors(),
				bookingPart: BookingPartStore.getCreateErrors()
			}
		})
	}
}
