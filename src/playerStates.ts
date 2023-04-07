import { type Game } from './Game'
import { PlayerAnimation } from './Player'

export enum EPlayerState {
  idleLeft = 'idleLeft',
  idleRight = 'idleRight',
  runLeft = 'runLeft',
  runRight = 'runRight',
  jumpLeft = 'jumpLeft',
  jumpRight = 'jumpRight',
  fallLeft = 'fallLeft',
  fallRight = 'fallRight',
  enterDoorLeft = 'enterDoorLeft',
  enterDoorRight = 'enterDoorRight',
}

interface IPlayerStateOptions {
  game: Game
  state: EPlayerState
}

export class PlayerState {
  public game!: Game
  public state!: EPlayerState
  constructor ({ game, state }: IPlayerStateOptions) {
    this.state = state
    this.game = game
  }

  enter (): void {
    throw new Error('enter() not implemented in child class')
  }

  handleInput (): void {
    throw new Error('handleInput() not implemented in child class')
  }
}

interface IPlayerStateChildOptions {
  game: Game
}

export class IdleLeft extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.idleLeft })
  }

  enter (): void {
    const { player } = this.game
    player.switchAnimation(PlayerAnimation.idleLeft)
  }

  handleInput (): void {
    const { inputHandler, player } = this.game
    if (inputHandler.hasDirectionUp()) {
      if (inputHandler.hasDirectionRight()) {
        player.setState(EPlayerState.jumpRight)
      } else {
        player.setState(EPlayerState.jumpLeft)
      }
    } else if (inputHandler.hasDirectionLeft()) {
      player.setState(EPlayerState.runLeft)
    } else if (inputHandler.hasDirectionRight()) {
      player.setState(EPlayerState.runRight)
    }
  }
}

export class IdleRight extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.idleRight })
  }

  enter (): void {
    const { player } = this.game
    player.switchAnimation(PlayerAnimation.idleRight)
  }

  handleInput (): void {
    const { inputHandler, player } = this.game
    if (inputHandler.hasDirectionUp()) {
      if (inputHandler.hasDirectionLeft()) {
        player.setState(EPlayerState.jumpLeft)
      } else {
        player.setState(EPlayerState.jumpRight)
      }
    } else if (inputHandler.hasDirectionLeft()) {
      player.setState(EPlayerState.runLeft)
    } else if (inputHandler.hasDirectionRight()) {
      player.setState(EPlayerState.runRight)
    }
  }
}

export class RunLeft extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.runLeft })
  }

  enter (): void {
    const { player } = this.game
    player.switchAnimation(PlayerAnimation.runLeft)
  }

  handleInput (): void {
    const { inputHandler, player } = this.game
    if (inputHandler.hasDirectionUp()) {
      if (inputHandler.hasDirectionRight()) {
        player.setState(EPlayerState.jumpRight)
      } else {
        player.setState(EPlayerState.jumpLeft)
      }
    } else if (inputHandler.hasDirectionRight()) {
      player.setState(EPlayerState.runRight)
    } else if (!inputHandler.hasDirectionLeft()) {
      player.setState(EPlayerState.idleLeft)
    }
  }
}

export class RunRight extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.runRight })
  }

  enter (): void {
    const { player } = this.game
    player.switchAnimation(PlayerAnimation.runRight)
  }

  handleInput (): void {
    const { inputHandler, player } = this.game
    if (inputHandler.hasDirectionUp()) {
      if (inputHandler.hasDirectionLeft()) {
        player.setState(EPlayerState.jumpLeft)
      } else {
        player.setState(EPlayerState.jumpRight)
      }
    } else if (inputHandler.hasDirectionLeft()) {
      player.setState(EPlayerState.runLeft)
    } else if (!inputHandler.hasDirectionRight()) {
      player.setState(EPlayerState.idleRight)
    }
  }
}

export class JumpLeft extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.jumpLeft })
  }

  enter (): void {
    const { player } = this.game
    if (player.isOnGround()) {
      player.jump()
    }
    player.switchAnimation(PlayerAnimation.runLeft)
  }

  handleInput (): void {
    const { player } = this.game
    if (player.isFalling()) {
      player.setState(EPlayerState.fallLeft)
    }
  }
}

export class JumpRight extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.jumpRight })
  }

  enter (): void {
    const { player } = this.game
    if (player.isOnGround()) {
      player.jump()
    }
    player.switchAnimation(PlayerAnimation.runRight)
  }

  handleInput (): void {
    const { player } = this.game
    if (player.isFalling()) {
      player.setState(EPlayerState.fallRight)
    }
  }
}

export class FallLeft extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.fallLeft })
  }

  enter (): void {
    const { player } = this.game
    player.switchAnimation(PlayerAnimation.runLeft)
  }

  handleInput (): void {
    const { player } = this.game
    if (player.isOnGround()) {
      player.setState(EPlayerState.runLeft)
    }
  }
}

export class FallRight extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.fallRight })
  }

  enter (): void {
    const { player } = this.game
    player.switchAnimation(PlayerAnimation.runRight)
  }

  handleInput (): void {
    const { player } = this.game
    if (player.isOnGround()) {
      player.setState(EPlayerState.runRight)
    }
  }
}

export class EnterDoorLeft extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.enterDoorLeft })
  }

  enter (): void {
    const { player } = this.game
    player.switchAnimation(PlayerAnimation.enterDoorLeft)
  }

  handleInput (): void {

  }
}

export class EnterDoorRight extends PlayerState {
  constructor ({ game }: IPlayerStateChildOptions) {
    super({ game, state: EPlayerState.enterDoorRight })
  }

  enter (): void {
    const { player } = this.game
    player.switchAnimation(PlayerAnimation.enterDoorRight)
  }

  handleInput (): void {

  }
}
