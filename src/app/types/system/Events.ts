export interface Event {
    type: 'message' | 'updated' | 'post',
    id: number | null,
    data: any
}