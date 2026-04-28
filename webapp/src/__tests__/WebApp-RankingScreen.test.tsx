import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Ranking from '../screens/ranking/Ranking'
import RankingFiltered from '../screens/ranking/RankingFiltered'
import RankingGeneral from '../screens/ranking/RankingGeneral'
import RankingDifficulty from '../screens/ranking/RankingDifficulty'
import RankingStrategy from '../screens/ranking/RankingStrategy'
import { getMedal, sortData } from '../screens/ranking/RankingFiltered'
import { afterEach, describe, expect, test, vi } from 'vitest'
import '@testing-library/jest-dom'

// Datos mock compartidos 

/**
 * Mocks y datos de ejemplo para los tests de Ranking y sus componentes hijos.
 * Incluye un ranking de ejemplo, una función mock para obtener datos, y una función mock para obtener medallas según la posición.
 * Estos mocks se utilizan en varios tests para simular las respuestas de la API y verificar el comportamiento de los componentes de ranking sin depender de datos reales o llamadas a la API.
 * El ranking de ejemplo contiene cuatro usuarios con sus respectivas victorias y porcentajes, y la función mock de obtener datos devuelve
 * una lista de entradas de ranking con posiciones, nombres de usuario, valores y porcentajes. 
 */
const mockRanking = [
    { username: 'iyan',  value: 5, percentage: 100   },
    { username: 'jimena',   value: 5, percentage: 83.33  },
    { username: 'sara', value: 4, percentage: 66.67  },
    { username: 'ji2', value: 3, percentage: 16.67  },
]
// Función para generar una entrada de ranking mock con valores por defecto y posibilidad de sobrescribirlos
const mockRankingEntry = (overrides = {}) => ({
    position: 1, username: 'sara', value: 4, percentage: '66.67', ...overrides
})

// Mock de obtenerDatos para los hijos de RankingFiltered
const mockObtenerDatos = vi.fn().mockResolvedValue([
    mockRankingEntry({ position: 1, username: 'iyan',  value: 5, percentage: '100'   }),
    mockRankingEntry({ position: 2, username: 'jimena',   value: 5, percentage: '83.33' }),
    mockRankingEntry({ position: 3, username: 'sara', value: 4, percentage: '66.67' }),
    mockRankingEntry({ position: 4, username: 'ji2', value: 3, percentage: '16.67' }),
])

// Función mock para obtener medalla según posición
const mockGetMedal = (pos: number) => pos <= 3 ? ['🥇','🥈','🥉'][pos-1] : `#${pos}`


/**
 * Tests para Ranking y sus componentes hijos que comprueban que:
 * - Se muestra el título de Ranking global
 * - Se muestra la posición del usuario tras cargar
 * - Se muestra "Sin posicion" si el usuario no está en el ranking
 * - Se muestra "No disponible" si la llamada falla
 * - Se muestran los botones de navegación
 * - Se navega al ranking filtrado al pulsar Ver ranking
 * - Se navega al menú principal al pulsar Volver al menú principal
 * - Se muestra el título y las cabeceras en RankingGeneral
 * - Se muestra el título y las cabeceras en RankingDifficulty
 * - Se muestra el título y las cabeceras en RankingStrategy
 * - La función de ordenación sortData ordena correctamente por valor y porcentaje
 * - La función getMedal devuelve la medalla correcta para las posiciones 1, 2, 3 y el formato #pos para otras posiciones
 * - Se muestra la sección de clasificación general por defecto en RankingFiltered
 * - Se activa y desactiva sección al pulsar filtro en RankingFiltered
 * - Se muestra sección de dificultad al activarla en RankingFiltered
 * - Se muestra sección de estrategia al activarla en RankingFiltered
 * - Se navega al ranking general al pulsar Volver al ranking general en RankingFiltered
 * - Se navega al menú principal al pulsar Volver al menú principal en RankingFiltered
 */
describe('Ranking', () => {
    afterEach(() => {
        vi.restoreAllMocks()
        mockObtenerDatos.mockClear()
    })

    // Ranking (pantalla principal)

    /**
     * Comprueba que se muestra el título de Ranking global.
     * El test simula la carga de la pantalla de ranking con un usuario "sara", y verifica que se muestre el título "Ranking global" en la pantalla.
     */
    test('muestra el título Ranking global', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<Ranking username="sara" />)
        expect(screen.getByText('Ranking global')).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra la posición del usuario tras cargar.ç
     * El test simula la carga de la pantalla de ranking con un usuario "sara", y verifica que se muestre la posición "#3" correspondiente a "sara" en el ranking de ejemplo.
     */
    test('muestra la posición del usuario tras cargar', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<Ranking username="sara" />)
        await waitFor(() => {
            expect(screen.queryByText(/Tu posición en el ranking es\.\.\./i)).toBeInTheDocument()
            expect(screen.getByText('#3')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra "Sin posicion" si el usuario no está en el ranking.
     * El test simula la carga de la pantalla de ranking con un usuario "desconocido" que no está presente en el ranking de ejemplo, y verifica que se muestre el texto "Sin posicion" en lugar de una posición numérica.
     */
    test('muestra "Sin posicion" si el usuario no está en el ranking', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<Ranking username="desconocido" />)
        await waitFor(() => {
            expect(screen.getByText('Sin posicion')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra "No disponible" si la llamada falla.
     * El test simula una falla en la llamada a la API al cargar la pantalla de ranking con un usuario "sara", y verifica que se muestre el texto "No disponible" en la pantalla para indicar que no se pudieron cargar los datos del ranking.
     */
    test('muestra "No disponible" si la llamada falla', async () => {
        global.fetch = vi.fn().mockRejectedValue(new Error('Network error'))
        render(<Ranking username="sara" />)
        await waitFor(() => {
            expect(screen.getByText('No disponible')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestran los botones de navegación.
     * El test simula la carga de la pantalla de ranking con un usuario "sara", y verifica que se muestren los botones "Ver ranking" para navegar al ranking filtrado, y "Volver al menú principal" para regresar al menú principal.
     */
    test('muestra los botones de navegación para volver al menú principal y para ver ranking', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<Ranking username="sara" />)
        expect(screen.getByRole('button', { name: /Ver ranking/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Volver al menú principal/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se navega al ranking filtrado al pulsar Ver ranking.
     * El test simula un usuario pulsando el botón de Ver ranking para navegar al ranking filtrado, y verifica que se muestre el título "Ranking global" presente en la pantalla de ranking filtrado, y que no se muestre el mensaje de posición del usuario que solo está en la pantalla de ranking general.
     */
    test('navega al ranking filtrado al pulsar Ver ranking', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<Ranking username="sara" />)
        await user.click(screen.getByRole('button', { name: /Ver ranking/i }))
        await waitFor(() => {
            expect(screen.queryByText(/Tu posición en el ranking es\.\.\./i)).not.toBeInTheDocument()
            expect(screen.getByText(/Ranking global/i)).toBeInTheDocument()
            expect(screen.getByRole('button', { name: /Volver al ranking general/i })).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se navega al menú principal al pulsar Volver al menú principal.
     * El test simula un usuario pulsando el botón de Volver al menú principal para regresar al menú principal, y verifica que se muestre el título "Ranking global" presente en la pantalla de ranking filtrado, y que no se muestre el mensaje de posición del usuario que solo está en la pantalla de ranking general.
     */
    test('navega al menú principal al pulsar Volver al menú principal', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<Ranking username="sara" />)
        await user.click(screen.getByRole('button', { name: /Volver al menú principal/i }))
        await waitFor(() => {
            expect(screen.queryByText('Ranking global')).not.toBeInTheDocument()
            expect(screen.getByText(/Bienvenido a tu menú principal, sara/i)).toBeInTheDocument()

        })
    })

    //  RankingFiltered 
    
/**
 * Comprueba que se muestra el título y los botones de filtro de Ranking global.
 * El test simula la carga de la pantalla de ranking filtrado con un usuario "sara", y verifica que se muestre el título "Ranking global" en la pantalla 
 * y que se muestren los botones de filtro "Por partidas", "Por dificultad" y "Por estrategia" para permitir al usuario filtrar el ranking según diferentes criterios.
 */
    test('muestra el título Ranking global y los botones de filtro', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<RankingFiltered username="sara" />)
        expect(screen.getByText('Ranking global')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Por partidas/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Por dificultad/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Por estrategia/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra la sección de clasificación general por defecto en RankingFiltered.
     * El test simula la carga de la pantalla de ranking filtrado con un usuario "sara", y verifica que aparezcan los botones de ordenación.
     */
    test('muestra los botones de ordenación Nº y %', async () => {
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<RankingFiltered username="sara" />)
        expect(screen.getByRole('button', { name: /Nº/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /%/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra la sección de clasificación general por defecto en RankingFiltered.
     * El test simula la carga de la pantalla de ranking filtrado con un usuario "sara", y verifica que se muestre la sección de clasificación general con el título "Clasificación general" en la pantalla.
     */
    test('activa y desactiva sección al pulsar filtro', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<RankingFiltered username="sara" />)
        // Por defecto "general" está activa (muestra Clasificación general)
        await waitFor(() => {
            expect(screen.getByText('Clasificación general')).toBeInTheDocument()
        })
        // Desactivar "general"
        await user.click(screen.getByRole('button', { name: /Por partidas/i }))
        await waitFor(() => {
            expect(screen.queryByText('Clasificación general')).not.toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra sección de clasificación general por defecto en RankingFiltered.
     * El test simula la carga de la pantalla de ranking filtrado con un usuario "sara", y verifica que se muestre la sección de clasificación por dificultad.
     */
    test('muestra sección de dificultad al activarla', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<RankingFiltered username="sara" />)
        await user.click(screen.getByRole('button', { name: /Por dificultad/i }))
        await waitFor(() => {
            expect(screen.getByText('Victorias por dificultad')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra sección de clasificación general por defecto en RankingFiltered.
     * El test simula la carga de la pantalla de ranking filtrado con un usuario "sara", y verifica que se muestre la sección de clasificación por estrategia.
     */
    test('muestra sección de estrategia al activarla', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<RankingFiltered username="sara" />)
        await user.click(screen.getByRole('button', { name: /Por estrategia/i }))
        await waitFor(() => {
            expect(screen.getByText('Victorias por estrategia')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se muestra la sección de clasificación general, por dificultad y por estrategia y se activan todos los filtros en RankingFiltered.
     * El test simula la carga de la pantalla de ranking filtrado con un usuario "sara", y verifica que se muestren las secciones de clasificación general, por dificultad y por estrategia al activar los tres filtros, y que se muestren los títulos correspondientes a cada sección en la pantalla.
     */
    test('muestra las secciones de clasificación general, por dificultad y por estrategia al activar los tres filtros', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<RankingFiltered username="sara" />)
        expect(screen.getByText('Clasificación general')).toBeInTheDocument()
      
        await user.click(screen.getByRole('button', { name: /Por dificultad/i }))
        await waitFor(() => {
            expect(screen.getByText('Victorias por dificultad')).toBeInTheDocument()
        })
        await user.click(screen.getByRole('button', { name: /Por estrategia/i }))
        await waitFor(() => {
            expect(screen.getByText('Victorias por estrategia')).toBeInTheDocument()
        })
     }) 

    /**
     * Comprueba que se navega al ranking general al pulsar Volver al ranking general.
     * El test simula un usuario pulsando el botón de Volver al ranking general para regresar a la sección de clasificación general dentro del ranking filtrado, y verifica que se muestre el título "Ranking global" presente en la sección de clasificación general, y que no se muestre el título de la sección de dificultad o estrategia que solo están en sus respectivas secciones.
     */
    test('navega al ranking general al pulsar Volver al ranking general', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<RankingFiltered username="sara" />)
        await user.click(screen.getByRole('button', { name: /Volver al ranking general/i }))
        await waitFor(() => {
            expect(screen.queryByText(/Ranking global/i)).toBeInTheDocument()
            expect(screen.queryByText(/Victorias por dificultad/i)).not.toBeInTheDocument()
            expect(screen.queryByText(/Victorias por estrategia/i)).not.toBeInTheDocument()
            expect(screen.queryByText(/Clasificación general/i)).not.toBeInTheDocument()
            expect(screen.getByText(/Tu posición en el ranking es\.\.\./i)).toBeInTheDocument()
            expect(screen.getByText('#3')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se navega al menú principal al pulsar Volver al menú principal.
     * El test simula un usuario pulsando el botón de Volver al menú principal para regresar al menú principal desde el ranking filtrado, y verifica que no se muestre el título "Ranking global" presente en la pantalla de ranking filtrado, y que se muestre el mensaje de posición del usuario que solo está en la pantalla de ranking general.
     */
    test('navega al menú principal al pulsar Volver al menú principal', async () => {
        const user = userEvent.setup()
        global.fetch = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ ranking: mockRanking }),
        } as Response)
        render(<RankingFiltered username="sara" />)
        await user.click(screen.getByRole('button', { name: /Volver al menú principal/i }))
        await waitFor(() => {
            expect(screen.queryByText('Ranking global')).not.toBeInTheDocument()
            expect(screen.getByText(/Bienvenido a tu menú principal, sara/i)).toBeInTheDocument()
        })
    })

    //  RankingGeneral 

    /**
     * Comprueba que se muestra el título y las cabeceras en RankingGeneral.
     * El test simula la carga de la sección de clasificación general dentro del ranking filtrado con un usuario "sara", y verifica que se muestre el título "Clasificación general" y las cabeceras "Posición" y "Jugador" en la pantalla, indicando que se ha cargado correctamente la sección de clasificación general con su estructura básica.
     */
    test('muestra el título y las cabeceras', async () => {
        render(<RankingGeneral username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        expect(screen.getByText('Clasificación general')).toBeInTheDocument()
        expect(screen.getByText('Posición')).toBeInTheDocument()
        expect(screen.getByText('Jugador')).toBeInTheDocument()
    })

    /**
     * Comprueba que se muestra los datos tras cargar en RankingGeneral.
     * El test simula la carga de la sección de clasificación general dentro del ranking filtrado con un usuario "sara", y verifica que se muestren los datos de los usuarios "iyan" y "sara" en la pantalla después de que se hayan cargado los datos mock proporcionados por la función mockObtenerDatos, indicando que la sección de clasificación general muestra correctamente los datos obtenidos.
     */
    test('muestra los datos tras cargar', async () => {
        render(<RankingGeneral username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        await waitFor(() => {
            expect(screen.getByText('iyan')).toBeInTheDocument()
            expect(screen.getByText('sara')).toBeInTheDocument()
            expect(screen.getByText('jimena')).toBeInTheDocument()
            expect(screen.getByText('ji2')).toBeInTheDocument()
        })
    })

    /**
     * Comprueba que se marca la fila del usuario actual en RankingGeneral.
     * El test simula la carga de la sección de clasificación general dentro del ranking filtrado con un usuario "sara", y verifica que la fila correspondiente al usuario "sara" en la tabla de clasificación general tenga la clase CSS "ranking-row--me", indicando que se ha marcado correctamente la fila del usuario actual para destacarla visualmente en el ranking.
     */
    test('marca la fila del usuario actual', async () => {
        render(<RankingGeneral username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        await waitFor(() => {
            const fila = screen.getByText('sara').closest('tr')
            expect(fila).toHaveClass('ranking-row--me')
        })
    })

    /**
     * Comprueba que se cambia a Derrotas al pulsar el filtro en RankingGeneral.
     * El test simula un usuario pulsando el botón de filtro "Derrotas" para cambiar la sección de clasificación general a mostrar las derrotas en lugar de las victorias, y verifica que se haya llamado a la función mockObtenerDatos con la URL "/ranking/defeats" y los parámetros vacíos, indicando que se ha intentado cargar correctamente los datos de derrotas al cambiar el filtro.
     */
    test('cambia a Derrotas al pulsar el filtro', async () => {
        const user = userEvent.setup()
        render(<RankingGeneral username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        await user.click(screen.getByRole('button', { name: /Derrotas/i }))
        await waitFor(() => {
            expect(mockObtenerDatos).toHaveBeenCalledWith('/ranking/defeats', {})
        })
    })

    //  RankingDifficulty 

    /**
     * Comprueba que se muestra el título y los botones de dificultad en RankingDifficulty.
     * El test simula la carga de la sección de clasificación por dificultad dentro del ranking filtrado con un usuario "sara", y verifica que se muestre el título "Victorias por dificultad" y los botones de filtro "Fácil", "Media" y "Difícil" en la pantalla, indicando que se ha cargado correctamente la sección de clasificación por dificultad con su estructura básica y opciones de filtro.
     */
    test('muestra el título y los botones de dificultad', async () => {
        render(<RankingDifficulty username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        expect(screen.getByText('Victorias por dificultad')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Fácil/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Media/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Difícil/i })).toBeInTheDocument()
    })

    /**
     * Comprueba que se cargan los datos al cambiar la dificultad en RankingDifficulty.
     * El test simula un usuario pulsando el botón de filtro "Media" para cambiar la sección de clasificación por dificultad a mostrar las victorias en dificultad media, y verifica que se haya llamado a la función mockObtenerDatos con la URL "/ranking/wins/difficulty" y los parámetros correspondientes a la dificultad media, indicando que se ha intentado cargar correctamente los datos de victorias por dificultad al cambiar el filtro.
     */
    test('RankingDifficulty: carga datos al cambiar dificultad', async () => {
        const user = userEvent.setup()
        render(<RankingDifficulty username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        await user.click(screen.getByRole('button', { name: /Media/i }))
        await waitFor(() => {
            expect(mockObtenerDatos).toHaveBeenCalledWith('/ranking/wins/difficulty', { difficulty: 'MEDIUM' })
        })
    })


    /**
     * Comprueba que se muestran los datos tras cargar en RankingDifficulty.
     * El test simula la carga de datos en la sección de clasificación por dificultad y verifica que se muestren los nombres de los usuarios en la pantalla, indicando que se han cargado correctamente los datos.
     */
    test('muestra los datos tras cargar', async () => {
        render(<RankingDifficulty username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        await waitFor(() => {
            expect(screen.getByText('iyan')).toBeInTheDocument()
            expect(screen.getByText('jimena')).toBeInTheDocument()
            expect(screen.getByText('sara')).toBeInTheDocument()
            expect(screen.getByText('ji2')).toBeInTheDocument()
            expect(screen.getByText('Victorias por dificultad')).toBeInTheDocument()
        })
    })

    // RankingStrategy 

    /**
     * Comprueba que se muestra el título y los botones de estrategia en RankingStrategy.
     * El test simula la carga de la sección de clasificación por estrategia dentro del ranking filtrado con un usuario "sara", y verifica que se muestre el título "Victorias por estrategia" y los botones de filtro "Random", "Defensiva" y "Monte Carlo" en la pantalla, indicando que se ha cargado correctamente la sección de clasificación por estrategia con su estructura básica y opciones de filtro.
     */
    test('muestra el título y los botones de estrategia', async () => {
        render(<RankingStrategy username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        expect(screen.getByText('Victorias por estrategia')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Random/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Defensiva/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Ofensiva/i })).toBeInTheDocument()
        //expect(screen.getByRole('button', { name: /Monte Carlo/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Monte Carlo Endurecido/i })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Monte Carlo Mejorado/i })).toBeInTheDocument()
    })

    test('RankingStrategy: carga datos al cambiar estrategia', async () => {
        const user = userEvent.setup()
        render(<RankingStrategy username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        await user.click(screen.getByRole('button', { name: /Defensiva/i }))
        await waitFor(() => {
            expect(mockObtenerDatos).toHaveBeenCalledWith('/ranking/wins/strategy', { strategy: 'DEFENSIVO' })
        })
    })

    /**
     * Comprueba que se muestran los datos tras cargar en RankingStrategy.
     * El test simula la carga de datos en la sección de clasificación por estrategia y verifica que se muestren los nombres de los usuarios en la pantalla, indicando que se han cargado correctamente los datos.
     */
    test('RankingStrategy: muestra los datos tras cargar', async () => {
        render(<RankingStrategy username="sara" obtenerDatos={mockObtenerDatos} getMedal={mockGetMedal} sortBy="value" />)
        await waitFor(() => {
            expect(screen.getByText('iyan')).toBeInTheDocument()
            expect(screen.getByText('jimena')).toBeInTheDocument()
            expect(screen.getByText('sara')).toBeInTheDocument()
            expect(screen.getByText('ji2')).toBeInTheDocument()
            expect(screen.getByText('Victorias por estrategia')).toBeInTheDocument()
        })
    })

    //  getMedal y sortData 

    /**
     * Comprueba que getMedal devuelve medallas para los tres primeros y formato #pos para otras posiciones.
     * El test verifica que la función getMedal devuelva las medallas 🥇, 🥈 y 🥉 para las posiciones 1, 2 y 3 respectivamente, y que devuelva el formato #pos (por ejemplo, #4) para otras posiciones, indicando que la función de asignación de medallas funciona correctamente según la posición en el ranking.
     */
    test('getMedal: devuelve medallas para los tres primeros', () => {
        expect(getMedal(1)).toBe('🥇')
        expect(getMedal(2)).toBe('🥈')
        expect(getMedal(3)).toBe('🥉')
        expect(getMedal(4)).toBe('#4')
    })

    /**
     * Comprueba que sortData ordena por value y percentage descendente y asigna la misma posición a empates.
     * El test verifica que la función sortData ordene correctamente una lista de entradas de ranking por el campo "value" y "percentage" en orden descendente, y que asigne la misma posición a las entradas que tengan el mismo valor o porcentaje, indicando que la función de ordenación y asignación de posiciones funciona correctamente para ambos criterios.
     */
    test('sortData: ordena por value descendente', () => {
        const data = [
            { position: 1, username: 's', value: 3, percentage: '50' },
            { position: 2, username: 'j', value: 5, percentage: '80' },
            { position: 3, username: 'i', value: 1, percentage: '20' },
        ]
        const sorted = sortData(data, 'value')
        expect(sorted[0].username).toBe('j')
        expect(sorted[1].username).toBe('s')
        expect(sorted[2].username).toBe('i')
    })

    /**
     * Comprueba que sortData ordena por percentage descendente.
     * El test verifica que la función sortData ordene correctamente una lista de entradas de ranking por el campo "percentage" en orden descendente, indicando que la función de ordenación funciona correctamente para el criterio de porcentaje.
     */
    test('sortData: ordena por percentage descendente', () => {
        const data = [
            { position: 1, username: 's', value: 3, percentage: '50'  },
            { position: 2, username: 'j', value: 5, percentage: '80'  },
            { position: 3, username: 'i', value: 1, percentage: '100' },
        ]
        const sorted = sortData(data, 'percentage')
        expect(sorted[0].username).toBe('i')
        expect(sorted[1].username).toBe('j')
        expect(sorted[2].username).toBe('s')
    })

    /**
     * Comprueba que sortData asigna la misma posición a empates.
     * El test verifica que la función sortData asigne la misma posición a las entradas de ranking que tengan el mismo valor o porcentaje, indicando que la función de asignación de posiciones maneja correctamente los empates en el ranking.
     */
    test('sortData: asigna la misma posición a empates', () => {
        const data = [
            { position: 1, username: 's', value: 5, percentage: '100' },
            { position: 2, username: 'j', value: 5, percentage: '100' },
            { position: 3, username: 'i', value: 3, percentage: '50'  },
        ]
        const sorted = sortData(data, 'value')
        expect(sorted[0].position).toBe(sorted[1].position)
        expect(sorted[2].position).toBe(3)
    })
})
