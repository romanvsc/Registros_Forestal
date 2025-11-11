const AIRTABLE_TOKEN = import.meta.env.VITE_AIRTABLE_TOKEN
const AIRTABLE_BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID
const AIRTABLE_TABLE_NAME = import.meta.env.VITE_AIRTABLE_TABLE_NAME

class AirtableService {
  constructor() {
    this.baseUrl = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`
    this.headers = {
      'Authorization': `Bearer ${AIRTABLE_TOKEN}`,
      'Content-Type': 'application/json'
    }
  }

  async getComprobantes(userName = null) {
    try {
      let url = this.baseUrl
      
      // Si se proporciona un usuario, filtrar por ese usuario en Airtable
      if (userName) {
        const filterFormula = `{Usuario}='${userName}'`
        url += `?filterByFormula=${encodeURIComponent(filterFormula)}`
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Error al obtener comprobantes: ${response.status}`)
      }

      const data = await response.json()
      
      // Transformar los datos de Airtable al formato de la app
      return data.records.map(record => ({
        id: record.id,
        fecha: record.fields.Fecha || '',
        detalle: record.fields.Detalle || '',
        frenteId: record.fields.FrenteId || record.fields.Frente || 0,
        ruc: record.fields.RUC || record.fields.Ruc || '',
        numeroFactura: record.fields.Factura || '',
        monto: record.fields.Salida || 0,
        usuario: record.fields.Usuario || '',
        entrada: record.fields.Entrada || 0,
        sincronizado: true
      }))
    } catch (error) {
      console.error('Error obteniendo comprobantes:', error)
      throw error
    }
  }

  async createComprobante(comprobante) {
    try {
      // Obtener el usuario actual
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      const userName = currentUser.nombre || 'Usuario'

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          fields: {
            Fecha: comprobante.fecha,
            Detalle: comprobante.detalle,
            Usuario: userName,
            Factura: comprobante.numeroFactura,
            FrenteId: parseInt(comprobante.frenteId),
            RUC: comprobante.ruc,
            Entrada: 0, // Por defecto 0
            Salida: parseFloat(comprobante.monto)
          }
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Error ${response.status}:`, errorText)
        throw new Error(`Error al crear comprobante: ${response.status}`)
      }

      const data = await response.json()
      console.log('Comprobante creado en Airtable:', data)
      return {
        id: data.id,
        fecha: comprobante.fecha,
        detalle: comprobante.detalle,
        frenteId: comprobante.frenteId,
        ruc: comprobante.ruc,
        numeroFactura: comprobante.numeroFactura,
        monto: comprobante.monto,
        usuario: userName,
        entrada: 0,
        sincronizado: true
      }
    } catch (error) {
      console.error('Error creando comprobante:', error)
      throw error
    }
  }

  async syncComprobantes(comprobantes) {
    const results = {
      success: [],
      errors: []
    }

    for (const comprobante of comprobantes) {
      try {
        const synced = await this.createComprobante(comprobante)
        results.success.push(synced)
      } catch (error) {
        results.errors.push({
          comprobante,
          error: error.message
        })
      }
    }

    return results
  }

  async deleteComprobante(id) {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'DELETE',
        headers: this.headers
      })

      if (!response.ok) {
        throw new Error(`Error al eliminar comprobante: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error('Error eliminando comprobante:', error)
      throw error
    }
  }
}

export default new AirtableService()
