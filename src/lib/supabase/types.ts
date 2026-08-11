// Tipos de la base de datos, escritos a mano a partir de supabase/schema.sql
// + supabase/migration_002_multi_torneo.sql. Si el esquema cambia,
// actualizar acá (o regenerar con `supabase gen types` una vez instalado
// el CLI de Supabase).

/** Rol global de la persona en toda la plataforma. */
export type Rol = "corredor" | "superadmin";
/** Rol dentro de un torneo puntual (independiente del rol global). */
export type RolTorneo = "organizador";

export type EstadoCarrera = "disputada" | "proxima";
export type TipoTorneo = "regional" | "nacional" | "internacional";
export type Genero = "masculino" | "femenino" | "mixto";

export interface Database {
  public: {
    Tables: {
      torneos: {
        Row: {
          id: string;
          nombre: string;
          tipo: TipoTorneo;
          activo: boolean;
          logo_url: string | null;
          color_primario: string | null;
          color_secundario: string | null;
          descartes_permitidos: number;
          presentismo_puntos_por_fecha: number;
          requiere_federado: boolean;
          suma_fecha_regional: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          nombre: string;
          tipo?: TipoTorneo;
          activo?: boolean;
          logo_url?: string | null;
          color_primario?: string | null;
          color_secundario?: string | null;
          descartes_permitidos?: number;
          presentismo_puntos_por_fecha?: number;
          requiere_federado?: boolean;
          suma_fecha_regional?: boolean;
        };
        Update: Partial<{
          nombre: string;
          tipo: TipoTorneo;
          activo: boolean;
          logo_url: string | null;
          color_primario: string | null;
          color_secundario: string | null;
          descartes_permitidos: number;
          presentismo_puntos_por_fecha: number;
          requiere_federado: boolean;
          suma_fecha_regional: boolean;
        }>;
        Relationships: [];
      };
      categorias: {
        Row: {
          id: string;
          torneo_id: string;
          slug: string;
          nombre: string;
          orden: number;
          edad_min: number | null;
          edad_max: number | null;
          genero: Genero | null;
        };
        Insert: {
          id?: string;
          torneo_id: string;
          slug: string;
          nombre: string;
          orden: number;
          edad_min?: number | null;
          edad_max?: number | null;
          genero?: Genero | null;
        };
        Update: Partial<{
          slug: string;
          nombre: string;
          orden: number;
          edad_min: number | null;
          edad_max: number | null;
          genero: Genero | null;
        }>;
        Relationships: [];
      };
      carreras: {
        Row: {
          id: string;
          torneo_id: string;
          numero: number;
          nombre: string;
          lugar: string;
          lat: number;
          lng: number;
          estado: EstadoCarrera;
        };
        Insert: {
          id: string;
          torneo_id: string;
          numero: number;
          nombre: string;
          lugar: string;
          lat: number;
          lng: number;
          estado: EstadoCarrera;
        };
        Update: Partial<{
          numero: number;
          nombre: string;
          lugar: string;
          lat: number;
          lng: number;
          estado: EstadoCarrera;
        }>;
        Relationships: [];
      };
      perfiles: {
        Row: {
          id: string;
          nombre: string;
          dni: string | null;
          fecha_nacimiento: string | null;
          bici: string | null;
          equipo: string | null;
          foto_url: string | null;
          federado: boolean;
          rol: Rol;
          created_at: string;
        };
        Insert: {
          id: string;
          nombre: string;
          dni?: string | null;
          fecha_nacimiento?: string | null;
          bici?: string | null;
          equipo?: string | null;
          foto_url?: string | null;
          federado?: boolean;
          rol?: Rol;
        };
        Update: Partial<{
          nombre: string;
          dni: string | null;
          fecha_nacimiento: string | null;
          bici: string | null;
          equipo: string | null;
          foto_url: string | null;
          federado: boolean;
          rol: Rol;
        }>;
        Relationships: [];
      };
      torneo_inscripciones: {
        Row: {
          id: string;
          torneo_id: string;
          perfil_id: string;
          categoria_id: string | null;
          numero: number | null;
          puntos_iniciales: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          torneo_id: string;
          perfil_id: string;
          categoria_id?: string | null;
          numero?: number | null;
          puntos_iniciales?: number;
        };
        Update: Partial<{
          categoria_id: string | null;
          numero: number | null;
          puntos_iniciales: number;
        }>;
        Relationships: [];
      };
      torneo_miembros: {
        Row: {
          id: string;
          torneo_id: string;
          perfil_id: string;
          rol: RolTorneo;
          created_at: string;
        };
        Insert: {
          id?: string;
          torneo_id: string;
          perfil_id: string;
          rol?: RolTorneo;
        };
        Update: Partial<{ rol: RolTorneo }>;
        Relationships: [];
      };
      corredores_precarga: {
        Row: {
          id: string;
          torneo_id: string;
          nombre: string;
          categoria_id: string;
          puntos_iniciales: number;
          perfil_id: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          torneo_id: string;
          nombre: string;
          categoria_id: string;
          puntos_iniciales?: number;
          perfil_id?: string | null;
        };
        Update: Partial<{
          nombre: string;
          categoria_id: string;
          puntos_iniciales: number;
          perfil_id: string | null;
        }>;
        Relationships: [];
      };
      resultados: {
        Row: {
          id: string;
          carrera_id: string;
          corredor_id: string;
          categoria_id: string;
          posicion: number;
          puntos: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          carrera_id: string;
          corredor_id: string;
          categoria_id: string;
          posicion: number;
          puntos?: number;
        };
        Update: Partial<{
          posicion: number;
          puntos: number;
        }>;
        Relationships: [];
      };
      puntos_por_posicion: {
        Row: { torneo_id: string; posicion: number; puntos: number };
        Insert: { torneo_id: string; posicion: number; puntos: number };
        Update: Partial<{ puntos: number }>;
        Relationships: [];
      };
    };
    Views: {
      ranking_general: {
        Row: {
          torneo_id: string;
          categoria_id: string;
          corredor_id: string;
          nombre: string;
          numero: number | null;
          bici: string | null;
          equipo: string | null;
          foto_url: string | null;
          puntos_base: number;
          total_puntos: number;
          es_precarga: boolean;
        };
        Relationships: [];
      };
      ranking_simple_posicion: {
        Row: {
          torneo_id: string;
          categoria_id: string;
          corredor_id: string;
          total_puntos: number;
          posicion: number;
        };
        Relationships: [];
      };
    };
    Functions: {
      vincular_precarga: {
        Args: { precarga_id: string; perfil_id_destino: string };
        Returns: undefined;
      };
      asignar_rol: {
        Args: { perfil_id_destino: string; nuevo_rol: Rol };
        Returns: undefined;
      };
      asignar_organizador: {
        Args: { p_torneo_id: string; p_perfil_id: string };
        Returns: undefined;
      };
      quitar_organizador: {
        Args: { p_torneo_id: string; p_perfil_id: string };
        Returns: undefined;
      };
    };
  };
}
