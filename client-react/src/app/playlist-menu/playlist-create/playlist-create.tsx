import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import { StoreState } from '../../shared/store/store-state';
import {
	playlistCreateAction,
	PlaylistCreateParams
} from '../../shared/store/playlists/playlist-create/playlist-create.action';
import Button from '../../shared/button/button';
import Input from '../../shared/input/input';
import { TimelineMax, TweenMax, Expo } from 'gsap';
import Icon from '../../shared/icon/icon';
import { PlaylistsActions } from '../../shared/store/playlists/playlists-action-type';
import { Playlists } from '../../shared/store/playlists/playlists';
import PlaylistCreateStyled, {
	Steps,
	Step,
	ButtonContainer,
	PaddedButton,
	OverflowHidden
} from './playlist-create.styled';
import { Confirmation } from './confirmation';
import colors from '../../shared/colors/colors';
import { playlistCreateResetAction } from '../../shared/store/playlists/playlist-create-reset/playlist-create-reset.action';
import { Transition } from 'react-transition-group';
import { ComponentClass } from 'react';

type Props = StateProps & DispatchProps & PassedProps;

class PlaylistCreate extends React.Component<Props, State> {
	nameInput: HTMLInputElement;
	descriptionInput: HTMLInputElement;
	playlistCreateStyled: HTMLDivElement;
	steps?: HTMLDivElement;

	defaultState: State = {
		step: 0,
		stepsTotal: 4,
		name: '',
		description: ''
	};

	state: State = this.defaultState;

	goToNextStep = () => {
		// TODO: Validate data in current step before moving to next...
		if (this.isStepValid(this.state.step)) {
			this.goToStep(this.state.step + 1);
		}
	};

	goToPreviousStep = () => {
		this.goToStep(this.state.step - 1);
	};

	goToStep = (step: number, tweenDuration?: number) => {
		this.setState({ step }, () => {
			TweenMax.to(
				this.steps,
				typeof tweenDuration === 'undefined' ? 0.5 : tweenDuration,
				{
					x: `${-100 / this.state.stepsTotal * this.state.step}%`,
					ease: Expo.easeOut,
					onComplete: this.handleStepTweenComplete
				}
			);
		});
	};

	goToStepOne = () => {
		this.goToStep(1);
	};

	handleStepTweenComplete = () => {
		switch (this.state.step) {
			case 1:
				this.nameInput!.focus();
				break;
			case 2:
				this.descriptionInput!.focus();
				break;
			case 3:
				this.submit();
				break;
			default:
		}
	};

	handleInputChange = event => {
		this.setState({
			[event.target.name]: event.target.value
		});
	};

	handleKeyPress = event => {
		if (event.shiftKey && event.key === 'Tab') {
			event.preventDefault();
			this.goToPreviousStep();
		} else if (event.key === 'Enter' || event.key === 'Tab') {
			event.preventDefault();
			this.goToNextStep();
		}
	};

	submit() {
		const { name, description } = this.state;

		this.props.create({ name, description });
	}

	isStepValid(step: number) {
		switch (step) {
			case 0:
				return true;
			case 1:
				return this.state.name.length > 1;
			case 2:
				return this.state.description.length > 2;
			default:
				throw new Error(`Validation for step ${step} not implemented`);
		}
	}

	reset = () => {
		TweenMax.to(this.playlistCreateStyled, 0.3, {
			backgroundColor: colors.white,
			onComplete: () => this.props.reset()
		});
	};

	doTransition = (node, done) => {
		const { in: inProp } = this.props;

		const tl = new TimelineMax();

		if (inProp) {
			tl.add(
				[
					TweenMax.fromTo(
						this.playlistCreateStyled,
						0.8,
						{ x: '-100%' },
						{ x: '0%', delay: 0.5, ease: Expo.easeOut }
					),
					TweenMax.fromTo(
						this.steps,
						0.5,
						{ x: `${-100 / this.state.stepsTotal * -1}%` },
						{
							x: '0%',
							delay: 0.5,
							ease: Expo.easeOut,
							onComplete: () => done()
						}
					)
				],
				null,
				null,
				0.3
			);
		} else {
			done();
		}
	};

	setPlaylistCreateStyledRef = ref => (this.playlistCreateStyled = ref);
	setStepsRef = ref => (this.steps = ref);
	setNameInputRef = ref => (this.nameInput = ref);
	setDescriptionInputRef = ref => (this.descriptionInput = ref);

	render() {
		const { className, playlists, in: inProp, component } = this.props;
		const { stepsTotal, name, description } = this.state;

		const WrapperComponent = component || 'div';

		return (
			<Transition
				in={inProp}
				addEndListener={this.doTransition}
				unmountOnExit={true}
			>
				<WrapperComponent>
					<OverflowHidden>
						<PlaylistCreateStyled
							className={className}
							innerRef={this.setPlaylistCreateStyledRef}
						>
							<Steps stepsTotal={stepsTotal} innerRef={this.setStepsRef}>
								<Step num={0}>
									<Button green onClick={this.goToNextStep}>
										Create a room +
									</Button>
								</Step>
								<Step num={1}>
									<h3>Name your room</h3>
									<Input
										type="text"
										innerRef={this.setNameInputRef}
										value={name}
										name="name"
										onChange={this.handleInputChange}
										onKeyDown={this.handleKeyPress}
									/>
									<ButtonContainer>
										<div>
											<PaddedButton
												noStyle
												onClick={this.goToNextStep}
												disabled={!this.isStepValid(1)}
											>
												<Icon id="arrow-right" size={2} />
											</PaddedButton>
										</div>
									</ButtonContainer>
								</Step>
								<Step num={2}>
									<h3>What's it all about?</h3>
									<Input
										type="text"
										innerRef={this.setDescriptionInputRef}
										value={description}
										name="description"
										onChange={this.handleInputChange}
										onKeyDown={this.handleKeyPress}
									/>
									<ButtonContainer>
										<div>
											<PaddedButton noStyle onClick={this.goToPreviousStep}>
												<Icon id="arrow-left" size={2} />
											</PaddedButton>
										</div>
										<div>
											<PaddedButton
												noStyle
												onClick={this.goToNextStep}
												disabled={!this.isStepValid(2)}
											>
												<Icon id="arrow-right" size={2} />
											</PaddedButton>
										</div>
									</ButtonContainer>
								</Step>
								<Step num={3}>
									<Confirmation
										playlistCreate={playlists.playlistCreate}
										onGoBack={this.goToStepOne}
										onSuccessComplete={this.reset}
									/>
								</Step>
							</Steps>
						</PlaylistCreateStyled>
					</OverflowHidden>
				</WrapperComponent>
			</Transition>
		);
	}
}

interface State {
	step: number;
	stepsTotal: number;
	nameInput?: HTMLInputElement;
	descriptionInput?: HTMLInputElement;
	name: string;
	description: string;
}

interface PassedProps {
	className?: string;
	component: string | ComponentClass;
	in?: boolean;
}

interface StateProps {
	playlists: Playlists;
}

interface DispatchProps {
	create: (createParams: PlaylistCreateParams) => {};
	reset: () => {};
}

const mapStateToProps = (state: StoreState) => ({
	playlists: state.playlists
});

const mapDispatchToProps = (
	dispatch: Dispatch<PlaylistsActions>
): DispatchProps => ({
	create: (createParams: PlaylistCreateParams) =>
		dispatch(playlistCreateAction(createParams)),
	reset: () => dispatch(playlistCreateResetAction())
});

export default connect<StateProps, DispatchProps, PassedProps>(
	mapStateToProps,
	mapDispatchToProps
)(PlaylistCreate);