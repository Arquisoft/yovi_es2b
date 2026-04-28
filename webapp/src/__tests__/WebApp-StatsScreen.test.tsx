import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import GameStatsTotal from '../screens/stats/GameStatsTotal'
import GameStatsFiltered from '../screens/stats/GameStatsFiltered'
import GameStatsDiff from '../screens/stats/GameStatsDifficuty'
import GameStatsStra from '../screens/stats/GameStatsStrategy'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'

/**
 * Imita las respuestas de las APIs de estadísticas para poder testear los componentes sin depender de la base de datos ni del backend.
 * Se definen tres arrays de objetos que representan las estadísticas de dificultad, estrategia y totales respectivamente. 
 * Cada objeto contiene los campos necesarios para mostrar los datos en las tablas de estadísticas.
 */
const mockDiffStats = [
    { dificultad: 'EASY',   ganadas: 4, perdidas: 2, jugadas: 6, porcentaje: '66.67 %' },
    { dificultad: 'MEDIUM', ganadas: 0, perdidas: 0, jugadas: 0, porcentaje: '0.00 %'  },
    { dificultad: 'HARD',   ganadas: 0, perdidas: 0, jugadas: 0, porcentaje: '0.00 %'  },
]

const mockStratStats = [
    { estrategia: 'RANDOM',                 ganadas: 2, perdidas: 1, jugadas: 3, porcentaje: '66.67 %'  },
    { estrategia: 'DEFENSIVO',              ganadas: 0, perdidas: 1, jugadas: 1, porcentaje: '0.00 %'   },
    { estrategia: 'OFENSIVO',               ganadas: 2, perdidas: 0, jugadas: 2, porcentaje: '100.00 %' },
    { estrategia: 'MONTE_CARLO',            ganadas: 0, perdidas: 0, jugadas: 0, porcentaje: '0.00 %'   },
    { estrategia: 'MONTE_CARLO_MEJORADO',   ganadas: 0, perdidas: 0, jugadas: 0, porcentaje: '0.00 %'   },
    { estrategia: 'MONTE_CARLO_ENDURECIDO', ganadas: 0, perdidas: 0, jugadas: 0, porcentaje: '0.00 %'   },
]

const mockAllStats = [
    { dificultad: 'EASY', estrategia: 'RANDOM',   ganadas: 2, perdidas: 1, jugadas: 3, porcentaje: '66.67 %' },
    { dificultad: 'MEDIUM', estrategia: 'DEFENSIVO', ganadas: 0, perdidas: 1, jugadas: 1, porcentaje: '0.00 %'  },
    { dificultad: '',     estrategia: 'TOTALES',   ganadas: 4, perdidas: 2, jugadas: 6, porcentaje: '66.67 %' },
]

describe('GameStats', () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    // GameStatsTotal

    /**
     * Comprueba que se muestra el título con el username.
     * El test simula la respuesta de la API de estadísticas totales, renderiza el componente GameStatsTotal con el username "sara", y verifica que se muestre el título "Todas las estadísticas de:" seguido del nombre "sara".
     */
    test('GameStatsTotal: muestra el título con el username', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockAllStats }) } as Response)
        render(<GameStatsTotal username="sara" />)
        await waitFor(() => {
            expect(screen.getByText(/Todas las estadísticas de:/i)).toBeInTheDocument()
            expect(screen.getByText('sara')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra la tabla con las cabeceras correctas.
     * El test verifica que se muestren las cabeceras "Dificultad", "Estrategia", "Victorias", "Derrotas", "Partidas jugadas" y "Porcentaje de victorias" en la tabla de estadísticas totales.
     */
    test('GameStatsTotal: muestra las cabeceras de la tabla', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockAllStats }) } as Response)
        render(<GameStatsTotal username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('Dificultad')).toBeInTheDocument()
            expect(screen.getByText('Estrategia')).toBeInTheDocument()
            expect(screen.getByText('Victorias')).toBeInTheDocument()
            expect(screen.getByText('Derrotas')).toBeInTheDocument()
            expect(screen.getByText('Partidas jugadas')).toBeInTheDocument()
            expect(screen.getByText('Porcentaje de victorias')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra los datos incluyendo la fila TOTALES.
     * El test verifica que se muestre una fila con la estrategia "TOTALES" y otra con la estrategia "RANDOM", lo que indica que se han cargado correctamente los datos de estadísticas totales.
     */
    test('GameStatsTotal: muestra los datos incluyendo la fila TOTALES', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockAllStats }) } as Response)
        render(<GameStatsTotal username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('TOTALES')).toBeInTheDocument()
            expect(screen.getByText('RANDOM')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se llama a /allstats con el username correcto.
     * El test simula la llamada a la API de estadísticas totales, y verifica que se haya llamado a la URL correcta con el método POST y el cuerpo que contiene el username "sara".
     */
    test('GameStatsTotal: llama a /allstats con el username correcto', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockAllStats }) } as Response)
        render(<GameStatsTotal username="sara" />)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/allstats'),
                expect.objectContaining({ method: 'POST', body: expect.stringContaining('sara') })
            )
        })
    })

    /**
     * Comprueba que se navega al pulsar Volver al menú de estadísticas.
     * El test simula la respuesta de la API de estadísticas totales, renderiza el componente GameStatsTotal, y luego simula un clic en el botón "Volver al menú de estadísticas". Finalmente, verifica que el título "Todas las estadísticas de:" ya no esté presente, lo que indica que se ha navegado fuera del componente de estadísticas totales.
     */
    test('GameStatsTotal: navega al pulsar Volver al menú de estadísticas', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockAllStats }) } as Response)
        render(<GameStatsTotal username="sara" />)
        await user.click(screen.getByRole('button', { name: /Volver al menú de estadísticas/i }))
        await waitFor(() => {
            expect(screen.queryByText(/Todas las estadísticas de:/i)).not.toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se navega al pulsar Volver al menú principal.
     * El test simula la respuesta de la API de estadísticas totales, renderiza el componente GameStatsTotal, y luego simula un clic en el botón "Volver al menú principal". Finalmente, verifica que el título "Todas las estadísticas de:" ya no esté presente, lo que indica que se ha navegado fuera del componente de estadísticas totales.
     */
    test('GameStatsTotal: navega al pulsar Volver al menú principal', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockAllStats }) } as Response)
        render(<GameStatsTotal username="sara" />)
        await user.click(screen.getByRole('button', { name: /Volver al menú principal/i }))
        await waitFor(() => {
            expect(screen.queryByText(/Todas las estadísticas de:/i)).not.toBeInTheDocument()
        })
    })

    // GameStatsFiltered

    /**
     * Comprueba que se muestra el título con el username.
     * El test simula las respuestas de las APIs de estadísticas de dificultad y estrategia, renderiza el componente GameStatsFiltered con el username "sara", y verifica que se muestre el título "Estadísticas filtradas de:" seguido del nombre "sara".
     */
    test('GameStatsFiltered: muestra el título con el username', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockDiffStats }) } as Response)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsFiltered username="sara" />)
        await waitFor(() => {
            expect(screen.getByText(/Estadísticas filtradas de:/i)).toBeInTheDocument()
            expect(screen.getByText('sara')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra los datos de dificultad y estrategia.
     * El test simula las respuestas de las APIs de estadísticas de dificultad y estrategia, renderiza el componente GameStatsFiltered, y verifica que se muestren los nombres de las dificultades ("EASY") y estrategias ("RANDOM", "OFENSIVO") presentes en los datos simulados.
     */
    test('GameStatsFiltered: muestra los datos de dificultad y estrategia', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockDiffStats }) } as Response)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsFiltered username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('EASY')).toBeInTheDocument()
            expect(screen.getByText('RANDOM')).toBeInTheDocument()
            expect(screen.getByText('OFENSIVO')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se llama a /diffstats y /stratstats.
     * El test simula las respuestas de las APIs de estadísticas de dificultad y estrategia, renderiza el componente GameStatsFiltered, y verifica que se hayan llamado a las URLs correctas para ambas APIs con el método POST y el cuerpo que contiene el username "sara".
     */
    test('GameStatsFiltered: llama a /diffstats y /stratstats', async () => {
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockDiffStats }) } as Response)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsFiltered username="sara" />)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/diffstats'), expect.any(Object))
            expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining('/stratstats'), expect.any(Object))
        })
    })

    /**
     * Comprueba que se navega al pulsar Volver al menú de estadísticas.
     * El test simula las respuestas de las APIs de estadísticas de dificultad y estrategia, renderiza el componente GameStatsFiltered, y luego simula un clic en el botón "Volver al menú de estadísticas". Finalmente, verifica que el título "Estadísticas filtradas de:" ya no esté presente, lo que indica que se ha navegado fuera del componente de estadísticas filtradas.
     */
    test('GameStatsFiltered: navega al pulsar Volver al menú de estadísticas', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockDiffStats }) } as Response)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsFiltered username="sara" />)
        await user.click(screen.getByRole('button', { name: /Volver al menú de estadísticas/i }))
        await waitFor(() => {
            expect(screen.queryByText(/Estadísticas filtradas de:/i)).not.toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se navega al pulsar Volver al menú principal.
     * El test simula las respuestas de las APIs de estadísticas de dificultad y estrategia, renderiza el componente GameStatsFiltered, y luego simula un clic en el botón "Volver al menú principal". Finalmente, verifica que el título "Estadísticas filtradas de:" ya no esté presente, lo que indica que se ha navegado fuera del componente de estadísticas filtradas.
     */
    test('GameStatsFiltered: navega al pulsar Volver al menú principal', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn()
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockDiffStats }) } as Response)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsFiltered username="sara" />)
        await user.click(screen.getByRole('button', { name: /Volver al menú principal/i }))
        await waitFor(() => {
            expect(screen.queryByText(/Estadísticas filtradas de:/i)).not.toBeInTheDocument()
        })
    })

    // GameStatsDifficulty

    /**
     * Comprueba que se muestra las cabeceras de la tabla.
     * El test simula la respuesta de la API de estadísticas de dificultad, renderiza el componente GameStatsDiff, y verifica que se muestren las cabeceras "Dificultad", "Victorias", "Derrotas", "Partidas jugadas" y "Porcentaje de victorias" en la tabla de estadísticas de dificultad.
     */
    test('GameStatsDifficulty: muestra las cabeceras de la tabla', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockDiffStats }) } as Response)
        render(<GameStatsDiff username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('Dificultad')).toBeInTheDocument()
            expect(screen.getByText('Victorias')).toBeInTheDocument()
            expect(screen.getByText('Derrotas')).toBeInTheDocument()
            expect(screen.getByText('Partidas jugadas')).toBeInTheDocument()
            expect(screen.getByText('Porcentaje de victorias')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra las tres dificultades tras cargar.
     * El test simula la respuesta de la API de estadísticas de dificultad, renderiza el componente GameStatsDiff, y verifica que se muestren los nombres de las dificultades "EASY", "MEDIUM" y "HARD" presentes en los datos simulados.
     */
    test('GameStatsDifficulty: muestra las tres dificultades tras cargar', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockDiffStats }) } as Response)
        render(<GameStatsDiff username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('EASY')).toBeInTheDocument()
            expect(screen.getByText('MEDIUM')).toBeInTheDocument()
            expect(screen.getByText('HARD')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra el porcentaje 66.67% para EASY.
     * El test simula la respuesta de la API de estadísticas de dificultad, renderiza el componente GameStatsDiff, y verifica que se muestre el porcentaje "66.67 %" para la dificultad "EASY" presente en los datos simulados.
     */
    test('GameStatsDifficulty: llama a /diffstats con el username correcto', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockDiffStats }) } as Response)
        render(<GameStatsDiff username="sara" />)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/diffstats'),
                expect.objectContaining({ method: 'POST', body: expect.stringContaining('sara') })
            )
        })
    })

    // GameStatsStrategy

    /**
     * Comprueba que se muestra las cabeceras de la tabla.
     * El test simula la respuesta de la API de estadísticas de estrategia, renderiza el componente GameStatsStra, y verifica que se muestren las cabeceras "Estrategia", "Victorias", "Derrotas", "Partidas jugadas" y "Porcentaje de victorias" en la tabla de estadísticas de estrategia.
     */
    test('GameStatsStrategy: muestra las cabeceras de la tabla', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsStra username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('Estrategia')).toBeInTheDocument()
            expect(screen.getByText('Victorias')).toBeInTheDocument()
            expect(screen.getByText('Derrotas')).toBeInTheDocument()
            expect(screen.getByText('Partidas jugadas')).toBeInTheDocument()
            expect(screen.getByText('Porcentaje de victorias')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra todas las estrategias tras cargar.
     * El test simula la respuesta de la API de estadísticas de estrategia, renderiza el componente GameStatsStra, y verifica que se muestren los nombres de las estrategias "RANDOM", "DEFENSIVO", "OFENSIVO", "MONTE_CARLO", "MONTE_CARLO_MEJORADO" y "MONTE_CARLO_ENDURECIDO" presentes en los datos simulados.
     */
    test('GameStatsStrategy: muestra todas las estrategias tras cargar', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsStra username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('RANDOM')).toBeInTheDocument()
            expect(screen.getByText('DEFENSIVO')).toBeInTheDocument()
            expect(screen.getByText('OFENSIVO')).toBeInTheDocument()
            expect(screen.getByText('MONTE_CARLO')).toBeInTheDocument()
            expect(screen.getByText('MONTE_CARLO_MEJORADO')).toBeInTheDocument()
            expect(screen.getByText('MONTE_CARLO_ENDURECIDO')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra el porcentaje 66.67% para RANDOM.
     * El test simula la respuesta de la API de estadísticas de estrategia, renderiza el componente GameStatsStra, y verifica que se muestre el porcentaje "66.67 %" para la estrategia "RANDOM" presente en los datos simulados.
     */
    test('GameStatsStrategy: muestra el porcentaje 100% para OFENSIVO', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsStra username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('100.00 %')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se llama a /stratstats con el username correcto.
     * El test simula la respuesta de la API de estadísticas de estrategia, renderiza el componente GameStatsStra, y verifica que se haya llamado a la URL correcta con el método POST y el cuerpo que contiene el username "sara".
     */
    test('GameStatsStrategy: llama a /stratstats con el username correcto', async () => {
        global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ stats: mockStratStats }) } as Response)
        render(<GameStatsStra username="sara" />)
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/stratstats'),
                expect.objectContaining({ method: 'POST', body: expect.stringContaining('sara') })
            )
        })
    })
})
