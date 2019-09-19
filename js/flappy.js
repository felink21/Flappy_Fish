function novoElemento(tagName, className) {
    const elem = document.createElement(tagName)
    elem.className = className
    return elem
}

function Barreira(reversa = false) {
    this.elemento = novoElemento('div', 'barreira')

    const borda = novoElemento('div', 'borda')
    const corpo = novoElemento('div', 'corpo')
    this.elemento.appendChild(reversa ? corpo : borda)
    this.elemento.appendChild(reversa ? borda : corpo)

    this.setAltura = altura => corpo.style.height = `${altura}px`
}

//const b = new Barreira(true)
//b.setAltura(200)
//document.querySelector('[wm-flappy]').appendChild(b.elemento)

function ParDeBarreiras(altura, abertura, x) {
    this.elemento = novoElemento('div', 'par-de-barreiras')

    this.superior = new Barreira(true)
    this.inferior = new Barreira(false)

    this.elemento.appendChild(this.superior.elemento)
    this.elemento.appendChild(this.inferior.elemento)

    this.sortearAbertura = () => {
        const alturaSuperior = Math.random() * (altura - abertura)
        const alturaInferior = altura - abertura - alturaSuperior
        this.superior.setAltura(alturaSuperior)
        this.inferior.setAltura(alturaInferior)
    }

    this.getX = () => parseInt(this.elemento.style.left.split('px')[0])
    this.setX = x => this.elemento.style.left = `${x}px`
    this.getLargura = () => this.elemento.clientWidth

    this.sortearAbertura()
    this.setX(x)
}

//const b = new ParDeBarreiras(700, 390, 500)
//document.querySelector('[wm-flappy]').appendChild(b.elemento)

function Barreiras(altura, largura, abertura, espaco, notificarPonto) {
    this.pares = [
        new ParDeBarreiras(altura, abertura, largura),
        new ParDeBarreiras(altura, abertura, largura + espaco),
        new ParDeBarreiras(altura, abertura, largura + espaco * 2),
        new ParDeBarreiras(altura, abertura, largura + espaco * 3)
    ]

    const deslocamento = 3
    this.animar = () => {
        this.pares.forEach(par => {
            par.setX(par.getX() - deslocamento)

            // quando elemento sair da tela
            if (par.getX() < -par.getLargura()) {
                par.setX(par.getX() + espaco * this.pares.length)
                par.sortearAbertura()
            }

            const meio = largura / 2 - 100
            const cruzouOMeio = par.getX() + deslocamento >= meio
                && par.getX() < meio
            if (cruzouOMeio) notificarPonto()
        })
    }
}

// Criando o Passaro
function Passaro(alturaJogo) {
    let voando = false

    this.elemento = novoElemento('img', 'passaro')
    this.elemento.src = 'imgs/passaro.png'

    this.getY = () => parseInt(this.elemento.style.bottom.split('px')[0])
    this.setY = y => this.elemento.style.bottom = `${y}px`

    window.onkeydown = e => voando = true
    window.onkeyup = e => voando = false

    this.animar = () => {
        const novoY = this.getY() + (voando ? 8 : -5)
        const alturaMaxima = alturaJogo - this.elemento.clientHeight

        if (novoY <= 0) {
            this.setY(0)
        } else if (novoY >= alturaMaxima) {
            this.setY(alturaMaxima)
        } else {
            this.setY(novoY)
        }
    }

    this.setY(alturaJogo / 2)
}

// Mostrar Pontuação
function Progresso() {
    this.elemento = novoElemento('span', 'progresso')
    this.atualizaPontos = pontos => {
        this.elemento.innerHTML = pontos
    }
    this.atualizaPontos(0)
}

// Detecta Colisão
function estaoSobrepostos(elementoA, elementoB) {
    const a = elementoA.getBoundingClientRect()
    const b = elementoB.getBoundingClientRect()

    const colisaoHorizontal = a.left + a.width >= b.left
                           && b.left + b.width >= a.left
    const colisaoVertical = a.top + a.height >= b.top
                         && b.top + b.height >= a.top

    return colisaoHorizontal && colisaoVertical
}

function colidiu(passaro, barreiras) {
    let colidiu = false
    barreiras.pares.forEach(cadaPar => {
        if (!colidiu) {
            const barreiraSuperior = cadaPar.superior.elemento
            const barreiraInferior = cadaPar.inferior.elemento
            colidiu = estaoSobrepostos(passaro.elemento, barreiraSuperior)
                   || estaoSobrepostos(passaro.elemento, barreiraInferior)
        }
    })
    return colidiu
}

// O JOGO
function FlappyFish() {
    let pontos = 0

    const areaDoJogo = document.querySelector('[wm-flappy]')
    const altura = areaDoJogo.clientHeight - 10
    const largura = areaDoJogo.clientWidth

    const prog = new Progresso()
    const barreiras = new Barreiras(altura, largura, 200, 400,
        () => prog.atualizaPontos(++pontos))
    const passaro = new Passaro(altura)
    
    areaDoJogo.appendChild(passaro.elemento)
    areaDoJogo.appendChild(prog.elemento)
    barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))
    
    this.start = () => {
        const temporizador = setInterval(() => {
            barreiras.animar()
            passaro.animar()

            if (colidiu(passaro, barreiras)) {
                clearInterval(temporizador)
                prog.elemento.innerHTML = 'Você Morreu!'
            }
        }, 20)
}
}

new FlappyFish().start()




//// const barreiras = new Barreiras(700, 1200, 400, 400)
//// const passaro = new Passaro(537)
//// const areaDoJogo = document.querySelector('[wm-flappy]')
//// const prog = new Progresso()

//// areaDoJogo.appendChild(passaro.elemento)
//// areaDoJogo.appendChild(prog.elemento)
// barreiras.pares.forEach(par => areaDoJogo.appendChild(par.elemento))

// setInterval(() => {
//     barreiras.animar()
//     passaro.animar()
// }, 20)

